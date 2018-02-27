var Product = require('../models/product');

const mongoose = require('mongoose');

mongoose.connect('localhost:27017/wd6international');


const products = [
  new Product({
    imagePath: '/images/oneplus5t.png',
    title: 'OnePlus 5T',
    description: 'Dual Camera Shoot clearer photos Optimized for low-light and portrait photography. Our highly rated 16 + 20 MP cameras help you capture crystal-clear shots. Design Expand your perspective Leap into a truly immersive flagship experience. Our Full Optic AMOLED 18:9 display complements the masterfully crafted all-aluminum body for a sleek, yet resilient design. OxygenOS Software so smooth, you’ll notice the difference The best of Android refined. OxygenOS is streamlined with feedback from our users for a refreshing user experience. Performance Packed with incredible power and speed Your experience with Qualcomm® Snapdragon™ 835 optimized, thanks to a seamless combination of hardware and software. Dash Charge Probably the best charging solution on the planet A day’s power in half an hour. Dash Charge, our signature powering solution, is the end of overnight charging. Network Move with freedom Ready to take on the world. Travel hassle-free with our unlocked Dual SIM flagship.',
    price: 600
  }),
  new Product({
    imagePath: '/images/galaxys8.png',
    title: 'Samsung Galaxy S8',
    description: 'Samsung Galaxy S8 has the cutting-edge features you need to do the things you love faster, easier and better. An Eye catching, 5.8 inch curved display goes all the way to the edge, so you can see more. The 12MP camera and advanced processor takes sharp, clear photos faster. Introducing Bixby - Samsung\'s new intelligent interface that is able to navigate easily through services and apps so that users can experience more with their phones.A phone this advanced deserves a network that can keep up.The Galaxy S8 comes in 64GB.',
    price: 700
  }),
  new Product({
    imagePath: '/images/iphonex.png',
    title: 'Apple iPhone X',
    description: 'iPhone x features an all-screen design with a 5.8-Inch super Retina HD display with HDR and true tone. Face ID lets you unlock and use Apple pay with just a glance. Powered by A11 Bionic, the most powerful and smartest chip ever in a smartphone. Supports augmented reality experiences in games and apps.',
    price: 999
  }),
  new Product({
    imagePath: '/images/razer.png',
    title: 'Razer Phone',
    description: 'The World’s First 120Hz Ultra Motion Display for smoother and truer graphics. Audio is powered by Dolby ATMOS and certified by THX for a true cinematic audio experience. Qualcomm Snapdragon 835 with 8GB RAM for optimized performance. **The Razer Phone is a GSM-compatible unlocked phone.',
    price: 700
  }),
  new Product({
    imagePath: '/images/galaxynote8.png',
    title: 'Samsung Galaxy Note 8',
    description: 'Do Bigger Things - See the bigger picture and communicate in a whole new way. With the Galaxy Note8 in your hand, bigger things are just waiting to happen. More screen means more space to do great things. Go big with the Galaxy Note8\'s 6.3" screen. It\'s the largest ever screen on a Note device and it still fits easily in your hand. Use the S Pen to express yourself in ways that make a difference. Draw your own emojis to show how you feel or write a message on a photo and send it as a handwritten note. Do things that matter with the S Pen. Get crisp photos even when it\'s dark and it\'s difficult to keep your phone steady. The Galaxy Note8\'s dual camera has a wide-angle camera that comes with the great low-light capabilities that you\'ve come to expect from Galaxy phones, while the telephoto camera gives you 2x optical zoom for you to capture the near and far. Both have optical image stabilization so you get steady shots even when zoomed in.',
    price: 819.99
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