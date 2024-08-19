import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, ScrollView, Alert, Linking, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';

const App = () => {
  const [products, setProducts] = useState([]);
  const [currentSection, setCurrentSection] = useState('about');
  const scrollViewRef = useRef(null);
  const [testimonials, setTestimonials] = useState([
    { id: '1', text: 'Excellent service and quality products! - Sarah' },
    { id: '2', text: 'I am thrilled with my purchase and the customer support was outstanding. - John' },
    { id: '3', text: 'Highly recommend this store for anyone looking for top-notch products. - Emily' },
  ]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [sectionOffsets, setSectionOffsets] = useState({});
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({ Name: '', Description: '', Price: '', StockQuantity: '', CategoryID: '' });
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/products')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setProducts(data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        Alert.alert('Error', `Failed to fetch products. Error: ${error.message}`);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex(prevIndex => (prevIndex + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleBuyNow = (productId) => {
    console.log('Initiating checkout session for product ID:', productId);
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
        console.log('Received data from checkout session:', data);
        if (data.error) {
          Alert.alert('Error', `Failed to create checkout session. Error: ${data.error}`);
          return;
        }
        const checkoutUrl = `https://checkout.stripe.com/pay/${data.id}`;
        console.log('Redirecting to Stripe checkout:', checkoutUrl);
        Linking.openURL(checkoutUrl)
          .catch(err => {
            console.error('Error opening checkout URL:', err);
            Alert.alert('Error', 'Failed to open checkout URL. Please try again.');
          });
      })
      .catch(error => {
        console.error('Error creating checkout session:', error);
        Alert.alert('Error', `Failed to create checkout session. Error: ${error.message}`);
      });
  };

  const scrollToSection = (section) => {
    setCurrentSection(section);
    if (scrollViewRef.current && sectionOffsets[section] !== undefined) {
      scrollViewRef.current.scrollTo({ y: sectionOffsets[section], animated: true });
    }
  };

  const handleLayout = (section) => (event) => {
    const { y } = event.nativeEvent.layout;
    setSectionOffsets(prevOffsets => ({
      ...prevOffsets,
      [section]: y,
    }));
  };

  const handleAdminLogin = () => {
    fetch('http://127.0.0.1:5000/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setIsAdmin(true);
          setAdminModalVisible(false);
        } else {
          Alert.alert('Error', 'Incorrect password');
        }
      })
      .catch(error => {
        console.error('Error logging in:', error);
        Alert.alert('Error', `Failed to login. Error: ${error.message}`);
      });
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        fetchProducts(); // Refresh product list
        setProductModalVisible(false);
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      alert('Error adding product');
      console.error(error);
    }
  };
  
  

  const handleUpdateProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/admin/products/${editingProduct.ProductID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        fetchProducts(); // Refresh product list
        setProductModalVisible(false);
        setEditingProduct(null);
      } else {
        alert('Failed to update product');
      }
    } catch (error) {
      alert('Error updating product');
      console.error(error);
    }
  };  

  const handleDeleteProduct = (productId) => {
    fetch(`http://127.0.0.1:5000/admin/products/${productId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        Alert.alert('Success', 'Product deleted successfully');
        // Refresh product list
        fetch('http://127.0.0.1:5000/products')
          .then(response => response.json())
          .then(data => setProducts(data))
          .catch(error => console.error('Error fetching products:', error));
      })
      .catch(error => {
        console.error('Error deleting product:', error);
        Alert.alert('Error', `Failed to delete product. Error: ${error.message}`);
      });
  };

  const openProductModal = (product = null) => {
    setEditingProduct(product);
    setNewProduct(product ? { ...product } : { Name: '', Description: '', Price: '', StockQuantity: '', CategoryID: '' });
    setProductModalVisible(true);
  };

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
        <TouchableOpacity onPress={() => setAdminModalVisible(true)} style={styles.menuItem}>
          <Text style={styles.menuText}>Admin</Text>
        </TouchableOpacity>
      </View>
      <ScrollView ref={scrollViewRef} style={styles.scrollContainer}>
        <View style={styles.section} onLayout={handleLayout('about')}>
          <Text style={styles.header}>About Us</Text>
          <Text style={styles.text}>Welcome to our store!</Text>
        </View>
        <View style={styles.section} onLayout={handleLayout('products')}>
          <Text style={styles.header}>Products</Text>
          {products.map(product => (
            <View key={product.ProductID} style={styles.product}>
              <Text style={styles.productName}>{product.Name}</Text>
              <Text style={styles.productPrice}>${product.Price}</Text>
              <TouchableOpacity style={styles.buyNowButton} onPress={() => handleBuyNow(product.ProductID)}>
                <Text style={styles.buyNowText}>Buy Now</Text>
              </TouchableOpacity>
              {isAdmin && (
                <View style={styles.adminButtons}>
                  <TouchableOpacity style={styles.button} onPress={() => openProductModal(product)}>
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleDeleteProduct(product.ProductID)}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          {isAdmin && (
            <TouchableOpacity style={styles.button} onPress={() => openProductModal()}>
              <Text style={styles.buttonText}>Add New Product</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.section} onLayout={handleLayout('testimonials')}>
          <Text style={styles.header}>Testimonials</Text>
          <View style={styles.testimonialContainer}>
            <Text style={styles.testimonialText}>{testimonials[currentTestimonialIndex].text}</Text>
          </View>
        </View>
        <View style={styles.section} onLayout={handleLayout('contact')}>
          <Text style={styles.header}>Contact Us</Text>
          <Text style={styles.text}>Email: contact@myawesomestore.com</Text>
          <Text style={styles.text}>Phone: (123) 456-7890</Text>
        </View>
      </ScrollView>

      {/* Admin Login Modal */}
      <Modal
        visible={adminModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAdminModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Admin Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleAdminLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setAdminModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Product Modal */}
      <Modal
        visible={productModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setProductModalVisible(false);
          setEditingProduct(null);
          setNewProduct({ Name: '', Description: '', Price: '', StockQuantity: '', CategoryID: '' });
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{editingProduct ? 'Edit Product' : 'Add New Product'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newProduct.Name}
              onChangeText={(text) => setNewProduct({ ...newProduct, Name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newProduct.Description}
              onChangeText={(text) => setNewProduct({ ...newProduct, Description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={newProduct.Price}
              onChangeText={(text) => setNewProduct({ ...newProduct, Price: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Stock Quantity"
              value={newProduct.StockQuantity}
              onChangeText={(text) => setNewProduct({ ...newProduct, StockQuantity: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Category ID"
              value={newProduct.CategoryID}
              onChangeText={(text) => setNewProduct({ ...newProduct, CategoryID: text })}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={editingProduct ? handleUpdateProduct : handleAddProduct}
            >
              <Text style={styles.buttonText}>{editingProduct ? 'Update Product' : 'Add Product'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setProductModalVisible(false);
                setEditingProduct(null);
                setNewProduct({ Name: '', Description: '', Price: '', StockQuantity: '', CategoryID: '' });
              }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    width: '100%',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
  },
  menuText: {
    color: 'black',
    fontSize: 18,
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  section: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  product: {
    marginBottom: 20,
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  buyNowButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  buyNowText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  testimonialContainer: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  testimonialText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  adminButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default App;