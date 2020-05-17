export default function changeTemplateFill() {

  // #MonkeyPatchingFTW
  // better than stealing the code, replacing one line and then release it under a/the wrong license..
  // Disadvantage: could need more fixing on updates. At least i didn#t make it line based like Kakaroto.. :P
  let oldFun = MeasuredTemplate.prototype.refresh.toString();
  
  let newFun = oldFun.replace(/this\.template\.beginTextureFill\(\{[\s\S]*\}\)\;/, `{
      let mat = PIXI.Matrix.IDENTITY;
      // rectangle
      if (this.shape.width && this.shape.height)
        mat.scale(this.shape.width / this.texture.width, this.shape.height / this.texture.height);
      else if (this.shape.radius) {
        mat.scale(this.shape.radius * 2 / this.texture.height, this.shape.radius * 2 / this.texture.width)
        // Circle center is texture start...
        mat.translate(-this.shape.radius, -this.shape.radius);
      } else if (this.data.t === "ray") {
        const d = canvas.dimensions,
              height = this.data.width * d.size / d.distance,
              width = this.data.distance * d.size / d.distance;
        mat.scale(width / this.texture.width, height / this.texture.height);
        mat.translate(0, -height * 0.5);

        mat.rotate(toRadians(this.data.direction));
      } else {// cone
        const d = canvas.dimensions;
    
        // Extract and prepare data
        let {direction, distance, angle} = this.data;
        distance *= (d.size / d.distance);
        direction = toRadians(direction);
        const width = this.data.distance * d.size / d.distance;

        const angles = [(angle/-2), (angle/2)];
        distance = distance * Math.cos(toRadians(angle/2));
    
        // Get the cone shape as a polygon
        const rays = angles.map(a => Ray.fromAngle(0, 0, direction + toRadians(a), distance+1));
        const height = Math.sqrt((rays[0].B.x - rays[1].B.x) * (rays[0].B.x - rays[1].B.x)
                        + (rays[0].B.y - rays[1].B.y) * (rays[0].B.y - rays[1].B.y));
        mat.scale(width / this.texture.width, height / this.texture.height);
        mat.translate(0, -height/2)
        mat.rotate(toRadians(this.data.direction));
      }
      this.template.beginTextureFill({
        texture: this.texture,
        matrix: mat,
        alpha: 0.8
      });
      // move into draw or so
      const source = getProperty(this.texture, "baseTexture.resource.source")
      if ( source && (source.tagName === "VIDEO") ) {
        source.loop = true;
        source.muted = true;
        game.video.play(source);
      }
    }`);
  MeasuredTemplate.prototype.refresh = Function(`"use strict"; return ( function ${newFun} )`)();

  Hooks.on('renderMeasuredTemplateConfig', (app, html, data) => {
    html[0].querySelector('.file-picker').dataset.type = 'imagevideo'
  });
}