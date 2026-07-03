/**
 * AfriBuild Marketplace - WebGL Shader Module
 * 
 * Creates an animated gradient background using WebGL for the hero section.
 * Features a smooth, flowing gradient animation that responds to scroll.
 */

class ShaderBackground {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`Canvas with id "${canvasId}" not found`);
      return;
    }

    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      console.warn('WebGL not supported');
      this.fallbackGradient();
      return;
    }

    this.options = {
      colors: options.colors || [
        [0.149, 0.388, 0.922],   // Blue
        [0.063, 0.725, 0.506],   // Green
        [0.961, 0.620, 0.043],   // Orange
        [0.388, 0.278, 0.922]    // Purple
      ],
      speed: options.speed || 0.5,
      intensity: options.intensity || 0.3,
      mouseInfluence: options.mouseInfluence !== false,
      scrollInfluence: options.scrollInfluence !== false,
      ...options
    };

    this.mouse = { x: 0.5, y: 0.5 };
    this.scroll = 0;
    this.time = 0;
    this.isRunning = false;
    this.animationId = null;

    this.init();
  }

  init() {
    this.setupShaders();
    this.setupBuffers();
    this.setupUniforms();
    this.setupEventListeners();
    this.resize();
    this.start();
  }

  setupShaders() {
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_scroll;
      uniform float u_speed;
      uniform float u_intensity;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform vec3 u_color4;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      void main() {
        vec2 uv = v_uv;
        vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
        uv *= aspect;
        
        float t = u_time * u_speed * 0.1;
        
        // Create flowing noise patterns
        float noise1 = snoise(uv * 1.5 + vec2(t * 0.3, t * 0.2));
        float noise2 = snoise(uv * 2.0 + vec2(-t * 0.2, t * 0.4));
        float noise3 = snoise(uv * 0.8 + vec2(t * 0.15, -t * 0.25));
        
        // Mouse influence
        float mouseDist = length(uv - u_mouse * aspect);
        float mouseInfluence = smoothstep(0.5, 0.0, mouseDist) * 0.2;
        
        // Scroll influence
        float scrollEffect = u_scroll * 0.001;
        
        // Combine noises for color blending
        float blend1 = noise1 * 0.5 + 0.5;
        float blend2 = noise2 * 0.5 + 0.5;
        float blend3 = noise3 * 0.5 + 0.5;
        
        // Apply intensity and scroll
        blend1 = mix(0.5, blend1, u_intensity) + scrollEffect * 0.3;
        blend2 = mix(0.5, blend2, u_intensity) - scrollEffect * 0.2;
        blend3 = mix(0.5, blend3, u_intensity) + mouseInfluence;
        
        // Mix colors based on noise
        vec3 color = mix(u_color1, u_color2, blend1);
        color = mix(color, u_color3, blend2 * 0.5);
        color = mix(color, u_color4, blend3 * 0.3);
        
        // Add subtle vignette
        float vignette = 1.0 - smoothstep(0.4, 1.4, length(v_uv - 0.5) * 1.5);
        color *= mix(0.7, 1.0, vignette);
        
        // Add subtle grain
        float grain = (fract(sin(dot(uv * 100.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.02;
        color += grain;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Shader program failed to link:', this.gl.getProgramInfoLog(this.program));
      this.fallbackGradient();
      return;
    }

    this.gl.useProgram(this.program);
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  setupBuffers() {
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0
    ]);
    
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  }

  setupUniforms() {
    this.uniforms = {
      time: this.gl.getUniformLocation(this.program, 'u_time'),
      resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
      mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
      scroll: this.gl.getUniformLocation(this.program, 'u_scroll'),
      speed: this.gl.getUniformLocation(this.program, 'u_speed'),
      intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
      color1: this.gl.getUniformLocation(this.program, 'u_color1'),
      color2: this.gl.getUniformLocation(this.program, 'u_color2'),
      color3: this.gl.getUniformLocation(this.program, 'u_color3'),
      color4: this.gl.getUniformLocation(this.program, 'u_color4')
    };
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());

    if (this.options.mouseInfluence) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = (e.clientX - rect.left) / rect.width;
        this.mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
      });
    }

    if (this.options.scrollInfluence) {
      window.addEventListener('scroll', () => {
        this.scroll = window.scrollY;
      }, { passive: true });
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  render() {
    if (!this.isRunning) return;

    this.time += 0.016; // ~60fps

    this.gl.uniform1f(this.uniforms.time, this.time);
    this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(this.uniforms.mouse, this.mouse.x, this.mouse.y);
    this.gl.uniform1f(this.uniforms.scroll, this.scroll);
    this.gl.uniform1f(this.uniforms.speed, this.options.speed);
    this.gl.uniform1f(this.uniforms.intensity, this.options.intensity);

    // Set colors
    this.gl.uniform3fv(this.uniforms.color1, this.options.colors[0]);
    this.gl.uniform3fv(this.uniforms.color2, this.options.colors[1]);
    this.gl.uniform3fv(this.uniforms.color3, this.options.colors[2]);
    this.gl.uniform3fv(this.uniforms.color4, this.options.colors[3]);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    this.animationId = requestAnimationFrame(() => this.render());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.render();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resize);
  }

  fallbackGradient() {
    // CSS fallback when WebGL is not available
    this.canvas.style.background = `linear-gradient(135deg, 
      rgb(37, 99, 235), 
      rgb(16, 185, 129), 
      rgb(245, 158, 11), 
      rgb(99, 102, 241))`;
    this.canvas.style.backgroundSize = '400% 400%';
    this.canvas.style.animation = 'gradientShift 15s ease infinite';
    
    // Add animation keyframes if not already present
    if (!document.getElementById('shader-fallback-styles')) {
      const style = document.createElement('style');
      style.id = 'shader-fallback-styles';
      style.textContent = `
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Initialize shader backgrounds on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize hero shader if canvas exists
  const heroCanvas = document.getElementById('hero-shader');
  if (heroCanvas) {
    window.heroShader = new ShaderBackground('hero-shader', {
      colors: [
        [0.149, 0.388, 0.922],   // Blue
        [0.063, 0.725, 0.506],   // Green
        [0.961, 0.620, 0.043],   // Orange
        [0.388, 0.278, 0.922]    // Purple
      ],
      speed: 0.4,
      intensity: 0.35,
      mouseInfluence: true,
      scrollInfluence: true
    });
  }
});

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ShaderBackground = ShaderBackground;
}
