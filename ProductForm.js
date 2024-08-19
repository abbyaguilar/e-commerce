// ProductForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({ Name: '', Price: '', StockQuantity: '', CategoryID: '' });

  useEffect(() => {
    if (id) {
      fetch(`http://127.0.0.1:5000/admin/products/${id}`)
        .then(response => response.json())
        .then(data => setProduct(data))
        .catch(error => console.error('Error:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://127.0.0.1:5000/admin/products/${id}` : 'http://127.0.0.1:5000/admin/products';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })
      .then(response => response.json())
      .then(() => navigate('/admin/products'))
      .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      <h1>{id ? 'Edit Product' : 'Add New Product'}</h1>
      <form onSubmit={handleSubmit}>
        <TextField
          name="Name"
          label="Name"
          value={product.Name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="Price"
          label="Price"
          type="number"
          value={product.Price}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="StockQuantity"
          label="Stock Quantity"
          type="number"
          value={product.StockQuantity}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="CategoryID"
          label="Category ID"
          type="number"
          value={product.CategoryID}
          onChange={handleChange}
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          {id ? 'Update Product' : 'Create Product'}
        </Button>
      </form>
    </div>
  );
};
