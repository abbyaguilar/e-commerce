import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, ScrollView, Alert, Linking, StyleSheet, TouchableOpacity } from 'react-native';

const App = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('about'); // Track the current section
  const scrollViewRef = useRef(null);
  const [testimonials, setTestimonials] = useState([
    { id: '1', text: 'Excellent service and quality products! - Sarah' },
    { id: '2', text: 'I am thrilled with my purchase and the customer support was outstanding. - John' },
    { id: '3', text: 'Highly recommend this store for anyone looking for top-notch products. - Emily' },
  ]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  useEffect(() => {
    if (currentSection === 'products') {
      fetch('http://127.0.0.1:5000/products')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setProducts(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          Alert.alert('Error', `Failed to fetch products. Error: ${error.message}`);
          setLoading(false);
        });
    }
  }, [currentSection]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 3000); // Change testimonial every 3 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleBuyNow = (productId) => {
    fetch('http://127.0.0.1:5000/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const checkoutUrl = `https://checkout.stripe.com/pay/${data.id}`;
        Linking.openURL(checkoutUrl)
          .catch(err => console.error('Error opening URL:', err));
      })
      .catch(error => {
        console.error('Error creating checkout session:', error);
        Alert.alert('Error', `Failed to create checkout session. Error: ${error.message}`);
      });
  };

  const scrollToSection = (section) => {
    setCurrentSection(section);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: sectionOffsets[section], animated: true });
    }
  };

  const sectionOffsets = {
    about: 0,
    products: 600, // Adjust these values based on actual content height
    testimonials: 1200,
    contact: 1800,
  };

  if (loading && currentSection === 'products') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.storeName}>My Awesome Store</Text>
      </View>
      <View style={styles.menu}>
        <TouchableOpacity onPress={() => scrollToSection('about')} style={styles.menuItem}>
          <Text style={styles.menuText}>About Us</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToSection('products')} style={styles.menuItem}>
          <Text style={styles.menuText}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToSection('testimonials')} style={styles.menuItem}>
          <Text style={styles.menuText}>Testimonials</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToSection('contact')} style={styles.menuItem}>
          <Text style={styles.menuText}>Contact</Text>
        </TouchableOpacity>
      </View>
      <ScrollView ref={scrollViewRef} style={styles.scrollContainer}>
        <View style={styles.section} id="about">
          <Text style={styles.header}>About Us</Text>
          <Text style={styles.text}>
            Welcome to My Awesome Store! We offer a wide range of high-quality products designed to meet your needs. Our mission is to deliver not only exceptional items but also unparalleled customer service. We are committed to excellence and continuously strive to improve our offerings to ensure complete customer satisfaction.
          </Text>
        </View>
        <View style={styles.section} id="products">
          {loading ? (
            <View style={styles.container}>
              <Text style={styles.text}>Loading...</Text>
            </View>
          ) : (
            products.length > 0 ? (
              products.map(product => (
                <View key={product.ProductID} style={styles.product}>
                  <Text style={styles.productName}>{product.Name}</Text>
                  <Text style={styles.productPrice}>${(product.Price / 100).toFixed(2)}</Text>
                  <Button title="Buy Now" onPress={() => handleBuyNow(product.ProductID)} />
                </View>
              ))
            ) : (
              <View style={styles.container}>
                <Text style={styles.text}>No products available</Text>
              </View>
            )
          )}
        </View>
        <View style={styles.section} id="testimonials">
          <Text style={styles.header}>Testimonials</Text>
          <View style={styles.testimonialContainer}>
            <Text style={styles.testimonialText}>
              {testimonials[currentTestimonialIndex].text}
            </Text>
          </View>
        </View>
        <View style={styles.section} id="contact">
          <Text style={styles.header}>Contact Us</Text>
          <Text style={styles.text}>Email: contact@myawesomestore.com</Text>
          <Text style={styles.text}>Phone: (123) 456-7890</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  storeName: {
    fontSize: 33,
    padding: 33,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 11,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuItem: {
    padding: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  menuText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 40,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  product: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
    alignItems: 'center',
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 20,
    color: 'green',
    textAlign: 'center',
    marginVertical: 10,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
  testimonialContainer: {
    width: '88%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  testimonialText: {
    fontSize: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default App;
