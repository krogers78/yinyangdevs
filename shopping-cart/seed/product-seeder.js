var Product = require('../models/product');

const mongoose = require('mongoose');

mongoose.connect('localhost:27017/wd6international');


const products = [
  new Product({
    imagePath: '/images/onplus5t.jpg',
    title: 'OnePlus 5T',
    description: 'Dual Camera Shoot clearer photos Optimized for low-light and portrait photography. Our highly rated 16 + 20 MP cameras help you capture crystal-clear shots. Design Expand your perspective Leap into a truly immersive flagship experience. Our Full Optic AMOLED 18:9 display complements the masterfully crafted all-aluminum body for a sleek, yet resilient design. OxygenOS Software so smooth, you’ll notice the difference The best of Android refined. OxygenOS is streamlined with feedback from our users for a refreshing user experience. Performance Packed with incredible power and speed Your experience with Qualcomm® Snapdragon™ 835 optimized, thanks to a seamless combination of hardware and software. Dash Charge Probably the best charging solution on the planet A day’s power in half an hour. Dash Charge, our signature powering solution, is the end of overnight charging. Network Move with freedom Ready to take on the world. Travel hassle-free with our unlocked Dual SIM flagship.',
    price: 600
  }),
  new Product({
    imagePath: '/images/galaxys8.jpg',
    title: 'Samsung Galaxy S8',
    description: 'Samsung Galaxy S8 has the cutting-edge features you need to do the things you love faster, easier and better. An Eye catching, 5.8 inch curved display goes all the way to the edge, so you can see more. The 12MP camera and advanced processor takes sharp, clear photos faster. Introducing Bixby - Samsung\'s new intelligent interface that is able to navigate easily through services and apps so that users can experience more with their phones.A phone this advanced deserves a network that can keep up.The Galaxy S8 comes in 64GB.',
    price: 700
  }),
  new Product({
    imagePath: '/images/iphonex.jpg',
    title: 'Apple iPhone X',
    description: 'iPhone x features an all-screen design with a 5.8-Inch super Retina HD display with HDR and true tone. Face ID lets you unlock and use Apple pay with just a glance. Powered by A11 Bionic, the most powerful and smartest chip ever in a smartphone. Supports augmented reality experiences in games and apps.',
    price: 999
  }),
  new Product({
    imagePath: '/images/razer.jpg',
    title: 'Razer Phone',
    description: 'The World’s First 120Hz Ultra Motion Display for smoother and truer graphics. Audio is powered by Dolby ATMOS and certified by THX for a true cinematic audio experience. Qualcomm Snapdragon 835 with 8GB RAM for optimized performance. **The Razer Phone is a GSM-compatible unlocked phone.',
    price: 700
  }),
];

let done = 0

products.forEach(e => {
  e.save((err, result) => {
    done++;
    if (done === products.length) {
      exit();
    }
  });
});

function exit() {
  mongoose.disconnect();
}