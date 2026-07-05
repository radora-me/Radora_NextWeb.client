const Jimp = require('jimp');
const path = require('path');

async function cropFavicon() {
  try {
    const inputPath = path.join(__dirname, '../public/logo/Next1.png');
    const outputPath = path.join(__dirname, '../src/app/icon.png');
    
    console.log(`Reading image from ${inputPath}...`);
    const image = await Jimp.read(inputPath);
    
    console.log('Autocropping transparent padding...');
    // autocrop trims transparent pixels from all sides
    image.autocrop();
    
    // Ensure it's square for a favicon by creating a new square canvas
    const size = Math.max(image.bitmap.width, image.bitmap.height);
    const squared = await new Jimp(size, size, 0x00000000); // transparent background
    
    // Center the cropped image on the square canvas
    const x = (size - image.bitmap.width) / 2;
    const y = (size - image.bitmap.height) / 2;
    squared.composite(image, x, y);
    
    console.log(`Saving cropped image to ${outputPath}...`);
    await squared.writeAsync(outputPath);
    console.log('Done!');
  } catch (err) {
    console.error('Error cropping image:', err);
    process.exit(1);
  }
}

cropFavicon();
