// ProductList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/admin/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:5000/admin/products/${id}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(() => setProducts(products.filter(product => product.ProductID !== id)))
      .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      <h1>Product List</h1>
      <Link to="/admin/products/new"><Button variant="contained" color="primary">Add New Product</Button></Link>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.ProductID}>
              <td>{product.Name}</td>
              <td>${(product.Price / 100).toFixed(2)}</td>
              <td>
                <Link to={`/admin/products/${product.ProductID}`}>
                  <Button variant="contained">Edit</Button>
                </Link>
                <Button variant="contained" color="error" onClick={() => handleDelete(product.ProductID)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
