E-Commerce Store

Project Overview
This project is a one-page e-commerce store featuring a React Native frontend and a Flask backend. It’s designed to offer a sleek and intuitive shopping experience with a clean interface, easy navigation, and secure payment processing through Stripe.

Key Features
The store's single-page layout ensures seamless navigation, with sections like About Us, Products, and Contact accessible through smooth scrolling.

Products are dynamically displayed, fetched in real-time from the backend, and customers can enjoy secure payment processing via Stripe. The
responsive design is optimized for all devices, providing an excellent user experience across mobile, tablet, and desktop. Additionally, the
testimonial section, which scrolls horizontally, enhances the store's credibility.

Technology Stack
The frontend is built using React Native, while Flask powers the backend. The database is managed with SQLite, and Stripe is integrated for payment processing. Custom CSS is used for styling, ensuring a unique look and feel. 

Setup Instructions
To set up the project, clone the repository and navigate to the project directory. 
For the frontend, run

    npm install

and for the backend, run 

    pip install -r requirements.txt


Start the backend by executing 

    python app.py 
  
and the frontend with 

    npm start  

Follow React Native’s instructions to view the app on an emulator or physical device.

How to Use
Browse the available products by scrolling to the "Products" section. 
To purchase an item, click "Buy Now" to initiate the checkout process through Stripe. 
For customer inquiries, the "Contact" section provides email and phone information.

