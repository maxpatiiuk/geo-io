# geo-io

Agar.io, but more mappy

## TODO

- There is too much water - spawn on land only?
  - https://developers.arcgis.com/javascript/latest/sample-code/sandbox/?sample=sketch-geometries
  - console.log(()=>sketch.viewModel.layer.graphics.\_items[0].toJSON().geometry.rings);
- Features don't spawn in whole map range - fix or constraint map movement
- FEATURE: add mega-particles
- FEATURE: implement mobs and AI
- Handle map edges (wrap around or stop?)

## Installation

- Clone this repository:

  ```sh
  git clone https://github.com/maxpatiiuk/geo-io/
  ```

- Install dependencies:

  ```sh
  npm install
  ```

- Run the app:

  ```sh
  # For Development:
  npm run dev
  # For Production:
  npm run build && npm run start
  ```

## Credits

- Inspired by [agar.io](https://agar.io/)
