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
    fetch('http://127.0.0.1:5000/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity: 1 })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          Alert.alert('Error', data.error);
        } else {
          Linking.openURL(`https://checkout.stripe.com/pay/${data.id}`);
        }
      })
      .catch(error => {
        console.error('Error creating checkout session:', error);
        Alert.alert('Error', `Failed to create checkout session. Error: ${error.message}`);
      });
  };

  const handleAdminLogin = () => {
    fetch('http://127.0.0.1:5000/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setIsAdmin(true);
          setAdminModalVisible(false);
        } else {
          Alert.alert('Login Failed', 'Incorrect password');
        }
      })
      .catch(error => {
        console.error('Error during admin login:', error);
        Alert.alert('Error', `Failed to login. Error: ${error.message}`);
      });
  };

  const handleAddProduct = () => {
    fetch('http://127.0.0.1:5000/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          Alert.alert('Success', data.message);
          setProductModalVisible(false);
        }
      })
      .catch(error => {
        console.error('Error adding product:', error);
        Alert.alert('Error', `Failed to add product. Error: ${error.message}`);
      });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductModalVisible(true);
  };

  const handleUpdateProduct = () => {
    fetch(`http://127.0.0.1:5000/admin/products/${editingProduct.ProductID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          Alert.alert('Success', data.message);
          setProductModalVisible(false);
          setEditingProduct(null);
        }
      })
      .catch(error => {
        console.error('Error updating product:', error);
        Alert.alert('Error', `Failed to update product. Error: ${error.message}`);
      });
  };

  const handleDeleteProduct = (productId) => {
    fetch(`http://127.0.0.1:5000/admin/products/${productId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          Alert.alert('Success', data.message);
          setProducts(products.filter(product => product.ProductID !== productId));
        }
      })
      .catch(error => {
        console.error('Error deleting product:', error);
        Alert.alert('Error', `Failed to delete product. Error: ${error.message}`);
      });
  };

  const scrollToSection = (section) => {
    setCurrentSection(section);
    scrollViewRef.current.scrollTo({ y: sectionOffsets[section], animated: true });
  };
  
  const handleSectionLayout = (section, event) => {
    const { y } = event.nativeEvent.layout;
    setSectionOffsets(prevOffsets => ({ ...prevOffsets, [section]: y }));
  };
  

  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>E-Commerce Store</Text>
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => scrollToSection('about')} style={styles.menuButton}>
            <Text style={styles.menuText}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('products')} style={styles.menuButton}>
            <Text style={styles.menuText}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('testimonials')} style={styles.menuButton}>
            <Text style={styles.menuText}>Testimonials</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('contact')} style={styles.menuButton}>
            <Text style={styles.menuText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAdminModalVisible(true)} style={styles.menuButton}>
            <Text style={styles.menuText}>Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View onLayout={(event) => handleSectionLayout('about', event)} style={styles.section}>
        <Text style={styles.sectionTitle}>About Us</Text>
        <Text style={styles.sectionContent}>We are a leading e-commerce store providing the best products with top-notch customer service.</Text>
      </View>

      <View onLayout={(event) => handleSectionLayout('products', event)} style={styles.section}>
        <Text style={styles.sectionTitle}>Products</Text>
        {products.map(product => (
          <View key={product.ProductID} style={styles.product}>
            <Text style={styles.productName}>{product.Name}</Text>
            <Text style={styles.productDescription}>{product.Description}</Text>
            <Text style={styles.productPrice}>${product.Price.toFixed(2)}</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleBuyNow(product.ProductID)}>
              <Text style={styles.buttonText}>Buy Now</Text>
            </TouchableOpacity>
            {isAdmin && (
              <View style={styles.adminButtons}>
                <TouchableOpacity style={styles.button} onPress={() => handleEditProduct(product)}>
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
          <TouchableOpacity style={styles.button} onPress={() => setProductModalVisible(true)}>
            <Text style={styles.buttonText}>Add New Product</Text>
          </TouchableOpacity>
        )}
      </View>

      <View onLayout={(event) => handleSectionLayout('testimonials', event)} style={styles.section}>
        <Text style={styles.sectionTitle}>Testimonials</Text>
        <Text style={styles.testimonial}>{testimonials[currentTestimonialIndex].text}</Text>
      </View>

      <View onLayout={(event) => handleSectionLayout('contact', event)} style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.sectionContent}>Feel free to reach out to us at contact@ecommerce.com</Text>
      </View>

      {/* Admin Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={adminModalVisible}
        onRequestClose={() => setAdminModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Admin Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Admin Password"
              secureTextEntry={true}
              onChangeText={setPassword}
              value={password}
            />
            <TouchableOpacity style={styles.button} onPress={handleAdminLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={productModalVisible}
        onRequestClose={() => {
          setProductModalVisible(false);
          setEditingProduct(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingProduct ? 'Edit Product' : 'Add New Product'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              onChangeText={text => setEditingProduct(prev => ({ ...prev, Name: text }))}
              value={editingProduct ? editingProduct.Name : newProduct.Name}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              onChangeText={text => setEditingProduct(prev => ({ ...prev, Description: text }))}
              value={editingProduct ? editingProduct.Description : newProduct.Description}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              keyboardType="numeric"
              onChangeText={text => setEditingProduct(prev => ({ ...prev, Price: text }))}
              value={editingProduct ? editingProduct.Price : newProduct.Price}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock Quantity"
              keyboardType="numeric"
              onChangeText={text => setEditingProduct(prev => ({ ...prev, StockQuantity: text }))}
              value={editingProduct ? editingProduct.StockQuantity : newProduct.StockQuantity}
            />
            <TextInput
              style={styles.input}
              placeholder="Category ID"
              onChangeText={text => setEditingProduct(prev => ({ ...prev, CategoryID: text }))}
              value={editingProduct ? editingProduct.CategoryID : newProduct.CategoryID}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={editingProduct ? handleUpdateProduct : handleAddProduct}
            >
              <Text style={styles.buttonText}>{editingProduct ? 'Update Product' : 'Add Product'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setProductModalVisible(false);
                setEditingProduct(null);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 33,
    fontWeight: 'bold',
  },
  menu: {
    flexDirection: 'row',
    marginTop: 10,
  },
  menuButton: {
    marginHorizontal: 5,
    paddingVertical: 5,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center', // Center content within the section
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'seni-bold',
    marginBottom: 10,
    textAlign: 'center', // Center the section title
  },
  sectionContent: {
    fontSize: 16,
    textAlign: 'center', // Center the section content
  },
  product: {
    padding: 10,
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center', // Center the product name
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center', // Center the product description
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center', // Center the product price
  },
  button: {
    backgroundColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  adminButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  testimonial: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '33%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
    padding: 8,
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#bbb',
  },
});


export default App;
