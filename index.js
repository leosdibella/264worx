const root = document.querySelector('#root');

class Field {
  static #activeSphereIndexFrameCount = 20;
  static #rotationFrameCount = 20;
  static #pixelsPerRem = parseInt(getComputedStyle(document.documentElement).fontSize);
  static #centerX = window.innerWidth / 2;
  static #centerY = window.innerHeight / 2;
  static #keys = ['w', 'a', 's', 'd', ' '];
  static #colors = ['#32a89b', '#a83287', '#3275a8', '#5c0000', '#3b8255'];
  static #depth = 5;
  static #width = 2;
  static #circleWidth = 0.25;
  static #pi = 3.14159265358979;
  static #adjustedWidth = Field.#pixelsPerRem * Field.#width;

  static #generateRandomColor() {
    return Field.#colors[Math.floor(Math.random() * Field.#colors.length)];
  }

  #spheres = [];
  #activeSphereIndex = 1;
  #activeCircles = [];
  #activeSphereIndexRaf = -1;
  #activeRotationRaf = -1;
  #activeRotationDirection = -1;
  #activeRotationSphereIndex = -1;

  #cancelAnimateRotation = () => {
    if (this.#activeRotationRaf > -1) {
      cancelAnimationFrame(this.#activeRotationRaf);
      this.#activeRotationRaf = -1;
      this.#updateRotation(Field.#rotationFrameCount, this.#activeRotationDirection);
      
      const spheres = this.#spheres[this.#activeRotationSphereIndex];
    
      this.#spheres[this.#activeRotationSphereIndex] = this.#activeRotationDirection === 1
        ? spheres.slice(1).concat([spheres[0]])
        : [spheres[spheres.length - 1]].concat(spheres.slice(0, spheres.length - 1));
      }

      console.log(this.#spheres[this.#activeSphereIndex]);
  };

  #updateRotation = (rotationFrame, direction) => {
    const spheres = this.#spheres[this.#activeRotationSphereIndex];
    const radius = ((2 * Field.#width) + 1) * this.#activeRotationSphereIndex;
    const mimimalAngle = (1 / spheres.length) * 2 * Field.#pi;
    
    spheres.forEach((s, i) => {
      const angle = (i * mimimalAngle) - (direction * (rotationFrame / Field.#rotationFrameCount) * mimimalAngle);
      const x = (radius * Field.#pixelsPerRem * Math.cos(angle)) - (Field.#adjustedWidth);
      const y = (radius * Field.#pixelsPerRem * Math.sin(angle)) - (Field.#adjustedWidth);

      s.style.top = `${Field.#centerY + y}px`;
      s.style.left = `${Field.#centerX + x}px`;
    });
  };

  #animateRotation = (rotationFrame, direction) => {
    if (rotationFrame <= Field.#rotationFrameCount) {
      this.#updateRotation(rotationFrame, direction);
      this.#activeRotationRaf = requestAnimationFrame(() => this.#animateRotation(rotationFrame + 1, direction));
    } else {
      this.#cancelAnimateRotation();
    }
  };

  #rotate = (direction) => {
    this.#cancelAnimateRotation();
    this.#activeRotationSphereIndex = this.#activeSphereIndex;
    this.#activeRotationDirection = direction;
    this.#animateRotation(1, direction);
  };

  #undulate = (nextActiveSphereIndex) => {
    const previousActiveSphereIndex = this.#activeSphereIndex;
    this.#activeSphereIndex = nextActiveSphereIndex;
    
    if (previousActiveSphereIndex !== this.#activeSphereIndex) {
      this.#cancelAnimateActiveSphereIndex();
      this.#animateActiveSphereIndex(1, previousActiveSphereIndex);
    }
  };

  #updateActiveIndex = (activeSphereIndexFrame, previousActiveFrameIndex) => {
    if (!this.#activeCircles.length) {
      const innerCircle = document.createElement('div');
      const outerCircle = document.createElement('div');
      const activeCircle = document.createElement('div');

      innerCircle.classList.add('circle');
      outerCircle.classList.add('circle');
      activeCircle.classList.add('circle');
      activeCircle.classList.add('circle-zero');

      root.appendChild(innerCircle);
      root.appendChild(outerCircle);
      root.appendChild(activeCircle);

      this.#activeCircles.push(innerCircle);
      this.#activeCircles.push(outerCircle);
      this.#activeCircles.push(activeCircle);
    }

    let innerRadius = Field.#pixelsPerRem * ((2 * Field.#width) + 1) * (2 * this.#activeSphereIndex - 1);
    let outerRadius = Field.#pixelsPerRem * ((2 * Field.#width) + 1) * (2 * this.#activeSphereIndex + 1);

    if (activeSphereIndexFrame !== undefined && previousActiveFrameIndex !== undefined) {
      const frameRatio = activeSphereIndexFrame / Field.#activeSphereIndexFrameCount;
      const previousInnerRadius = Field.#pixelsPerRem * ((2 * Field.#width) + 1) * (2 * previousActiveFrameIndex - 1);
      const previousOuterRadius = Field.#pixelsPerRem * ((2 * Field.#width) + 1) * (2 * previousActiveFrameIndex + 1);

      innerRadius = previousInnerRadius * (1 - frameRatio) + innerRadius * (frameRatio);
      outerRadius = previousOuterRadius * (1 - frameRatio) + outerRadius * (frameRatio);
    }

    this.#activeCircles[0].style.width = `${innerRadius}px`;
    this.#activeCircles[0].style.height = `${innerRadius}px`;
    this.#activeCircles[0].style.left = `${Field.#centerX - innerRadius / 2 - Field.#circleWidth * Field.#pixelsPerRem}px`;
    this.#activeCircles[0].style.top = `${Field.#centerY - innerRadius / 2 - Field.#circleWidth * Field.#pixelsPerRem}px`;

    this.#activeCircles[1].style.width = `${outerRadius}px`;
    this.#activeCircles[1].style.height = `${outerRadius}px`;
    this.#activeCircles[1].style.left = `${Field.#centerX - outerRadius / 2 - Field.#circleWidth * Field.#pixelsPerRem}px`;
    this.#activeCircles[1].style.top = `${Field.#centerY - outerRadius / 2 - Field.#circleWidth * Field.#pixelsPerRem}px`;

    this.#activeCircles[2].style.left = `${Field.#centerX + innerRadius / 2 + Field.#circleWidth * Field.#pixelsPerRem - 2 * Field.#width}px`;
    this.#activeCircles[2].style.top = `${Field.#centerY - (Field.#pixelsPerRem * (Field.#width + 2 * Field.#circleWidth))}px`;
  };

  #cancelAnimateActiveSphereIndex = () => {
    if (this.#activeSphereIndexRaf > -1) {
      cancelAnimationFrame(this.#activeSphereIndexRaf);
      this.#activeSphereIndexRaf = -1;
      this.#updateActiveIndex();
    }
  };

  #animateActiveSphereIndex = (activeSphereIndexFrame, previousActiveFrameIndex) => {
    if (activeSphereIndexFrame <= Field.#activeSphereIndexFrameCount) {
      this.#updateActiveIndex(activeSphereIndexFrame, previousActiveFrameIndex);
      this.#activeSphereIndexRaf = requestAnimationFrame(() => this.#animateActiveSphereIndex(activeSphereIndexFrame + 1, previousActiveFrameIndex));
    } else {
      this.#cancelAnimateActiveSphereIndex();
    }
  };

  handleKeyDown = (event) => {
    const key = event.key.toLowerCase();

    if (Field.#keys.indexOf(key) === -1) {
      return;
    }

    switch (key) {
      case 'w': {
        this.#undulate(Math.min(Field.#depth, this.#activeSphereIndex + 1));
        break;
      }
      case 's': {
        this.#undulate(Math.max(1, this.#activeSphereIndex - 1));
        break;
      }
      case 'a': {
        this.#rotate(-1);
        break;
      }
      case 'd': {
        this.#rotate(1);
        break;
      }
      case '_': {
        break;
      }
    }
  }

  constructor() {
    if (root) {
      const center = document.createElement('div');
      center.style.top = `${Field.#centerY - Field.#pixelsPerRem * 2}px`;
      center.style.left = `${Field.#centerX - Field.#pixelsPerRem * 2}px`;
      center.style.backgroundColor = '#ffffff';

      center.classList.add('sphere');
      root.appendChild(center);

      this.#spheres.push([center]);

      for (let i = 1; i <= Field.#depth; ++i) {
        const radius = ((2 * Field.#width) + 1) * i;
        const circumference = Field.#pi * Field.#pixelsPerRem * radius;
        const count = Math.floor(circumference / (Field.#pixelsPerRem * (Field.#width + 2 * Field.#circleWidth)));

        this.#spheres.push([]);

        for (let j = 0; j < count; ++j) {
          const angle = (j / count) * 2 * Field.#pi;
          const x = (radius * Field.#pixelsPerRem * Math.cos(angle)) - (Field.#adjustedWidth);
          const y = (radius * Field.#pixelsPerRem * Math.sin(angle)) - (Field.#adjustedWidth);
          const sphere = document.createElement('div');
  
          sphere.classList.add('sphere');
          sphere.id = `sphere_${i}_${j}`;
          sphere.innerHTML = `(${i},${j})`;
          sphere.style.backgroundColor = Field.#generateRandomColor();
          sphere.style.top = `${Field.#centerY + y}px`;
          sphere.style.left = `${Field.#centerX + x}px`;
  
          root.appendChild(sphere);
          this.#spheres[i].push(sphere);
        }
      }      

      window.addEventListener('keydown', this.handleKeyDown);
      this.#updateActiveIndex();
    }
  }
}

const field = new Field();
