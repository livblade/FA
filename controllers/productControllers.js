// ========================================
// Product Controller - COMPLETE WORKING VERSION WITH MESSAGES
// ========================================
const Product = require('../models/products');
const { buildCategoryOptions, DEFAULT_CATEGORY_OPTIONS } = require('../utils/categoryOptions');
const db = require('../db'); // Import database connection

/**
 * List all products
 */
function listAll(req, res) {
  const user = req.session.user || null;
  const view = user && user.role === 'admin' ? 'inventory' : 'shopping';
  
  Product.getAll((err, results) => {
    if (err) {
      return res.status(500).render(view, { 
        products: [], 
        error: 'Database error', 
        user,
        messages: req.flash(),
        categories: DEFAULT_CATEGORY_OPTIONS
      });
    }

    const categories = buildCategoryOptions(results);

    return res.render(view, { 
      products: results, 
      error: null, 
      user,
      messages: req.flash(),
      categories
    });
  });
}

/**
 * Get product details by ID WITH REVIEWS AND MESSAGES
 */
function getById(req, res) {
  const user = req.session.user || null;
  const id = parseInt(req.params.id, 10);
  
  if (Number.isNaN(id)) {
    req.flash('error', 'Invalid product ID');
    return res.redirect(user && user.role === 'admin' ? '/inventory' : '/shopping');
  }
  
  Product.getById(id, (err, product) => {
    if (err || !product) {
      req.flash('error', 'Product not found');
      return res.redirect(user && user.role === 'admin' ? '/inventory' : '/shopping');
    }
    
    // Get review data
    getReviewData(id, user, (reviewData) => {
      // Pass flash messages to template
      const messages = {
        success: req.flash('success'),
        error: req.flash('error')
      };
      
      return res.render('product', { 
        product, 
        error: null, 
        user,
        reviews: reviewData.reviews,
        avgRating: reviewData.avgRating,
        reviewCount: reviewData.reviewCount,
        userReview: reviewData.userReview,
        messages: messages  // ADDED THIS LINE
      });
    });
  });
}

/**
 * Helper: Get review data from database
 */
function getReviewData(productId, user, callback) {
  // Default data
  const reviewData = {
    reviews: [],
    avgRating: 0,
    reviewCount: 0,
    userReview: null
  };
  
  // 1. Get reviews
  const reviewsSql = `
    SELECT r.*, u.username,
    (SELECT COUNT(*) FROM review_helpful rh WHERE rh.review_id = r.review_id) AS helpfulCount,
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = r.product_id
        AND o.user_id = r.user_id
        AND o.status = 'Completed'
    ) AS verified
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `;
  
  db.query(reviewsSql, [productId], (err, reviews) => {
    if (err) {
      console.error('Error fetching reviews:', err);
    } else {
      reviewData.reviews = reviews || [];
    }
    
    // 2. Get average rating
    const avgSql = 'SELECT AVG(rating) AS avgRating, COUNT(*) AS count FROM reviews WHERE product_id = ?';
    db.query(avgSql, [productId], (err, avgResults) => {
      if (!err && avgResults && avgResults[0]) {
        reviewData.avgRating = parseFloat(avgResults[0].avgRating) || 0;
        reviewCount = parseInt(avgResults[0].count) || 0;
      }
      
      // 3. Get user's own review
      if (user && user.role === 'user') {
        const userReviewSql = 'SELECT * FROM reviews WHERE product_id = ? AND user_id = ? LIMIT 1';
        db.query(userReviewSql, [productId, user.id], (err, userResults) => {
          if (!err && userResults && userResults[0]) {
            reviewData.userReview = userResults[0];
          }
          callback(reviewData);
        });
      } else {
        callback(reviewData);
      }
    });
  });
}

/**
 * Add new product
 */
function add(req, res) {
  const user = req.session.user || null;
  const productName = req.body.productName || req.body.name;
  const category = req.body.category || 'General';
  const quantity = parseInt(req.body.quantity, 10);
  const price = parseFloat(req.body.price);
  const image = req.file ? req.file.filename : null;

  if (!productName || Number.isNaN(quantity) || Number.isNaN(price)) {
    req.flash('error', 'Missing or invalid fields');
    return res.status(400).render('addProduct', {
      user,
      messages: req.flash(),
      categories: DEFAULT_CATEGORY_OPTIONS
    });
  }

  if (!image) {
    req.flash('error', 'Product image is required');
    return res.status(400).render('addProduct', {
      user,
      messages: req.flash(),
      categories: DEFAULT_CATEGORY_OPTIONS
    });
  }

  Product.add({ productName, category, quantity, price, image }, (err) => {
    if (err) {
      console.error('Error adding product:', err);
      req.flash('error', 'Failed to add product');
      return res.status(500).render('addProduct', {
        user,
        messages: req.flash(),
        categories: DEFAULT_CATEGORY_OPTIONS
      });
    }
    req.flash('success', 'Product added successfully');
    return res.redirect('/inventory');
  });
}

/**
 * Display product update form
 */
function showUpdateForm(req, res) {
  const user = req.session.user || null;
  const id = parseInt(req.params.id, 10);
  
  if (Number.isNaN(id)) {
    return res.status(400).render('updateProduct', { 
      product: null, 
      error: 'Invalid product ID', 
      user, 
      categories: DEFAULT_CATEGORY_OPTIONS,
      messages: req.flash()
    });
  }
  
  Product.getById(id, (err, product) => {
    if (err) {
      return res.status(500).render('updateProduct', { 
        product: null, 
        error: 'Database error', 
        user, 
        categories: DEFAULT_CATEGORY_OPTIONS,
        messages: req.flash()
      });
    }
    
    if (!product) {
      return res.status(404).render('updateProduct', { 
        product: null, 
        error: 'Product not found', 
        user, 
        categories: DEFAULT_CATEGORY_OPTIONS,
        messages: req.flash()
      });
    }
    
    return res.render('updateProduct', { 
      product, 
      error: null, 
      user, 
      categories: DEFAULT_CATEGORY_OPTIONS,
      messages: req.flash()
    });
  });
}

/**
 * Update product information
 */
function update(req, res) {
  const user = req.session.user || null;
  const id = parseInt(req.params.id, 10);
  
  if (Number.isNaN(id)) {
    req.flash('error', 'Invalid product ID');
    return res.redirect('/inventory');
  }

  const productName = req.body.productName || req.body.name;
  const category = req.body.category || 'General';
  const quantity = parseInt(req.body.quantity, 10);
  const price = parseFloat(req.body.price);
  const image = req.file ? req.file.filename : (req.body.currentImage || null);

  const product = { productName, category, quantity, price, image };

  if (!productName || Number.isNaN(quantity) || Number.isNaN(price)) {
    req.flash('error', 'Missing or invalid fields');
    return res.redirect(`/updateProduct/${id}`);
  }

  Product.update(id, product, (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      req.flash('error', 'Failed to update product');
      return res.redirect(`/updateProduct/${id}`);
    }
    if (result && result.affectedRows === 0) {
      req.flash('error', 'Product not found');
      return res.redirect('/inventory');
    }
    req.flash('success', 'Product updated successfully');
    return res.redirect(`/product/${id}`);
  });
}

/**
 * Delete product
 */
function remove(req, res) {
  const user = req.session.user || null;
  const id = parseInt(req.params.id, 10);
  
  if (Number.isNaN(id)) {
    req.flash('error', 'Invalid product ID');
    return res.redirect('/inventory');
  }

  Product.delete(id, (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      req.flash('error', 'Failed to delete product');
      return res.redirect('/inventory');
    }
    if (result && result.affectedRows === 0) {
      req.flash('error', 'Product not found');
      return res.redirect('/inventory');
    }
    req.flash('success', 'Product deleted successfully');
    return res.redirect('/inventory');
  });
}

// Make sure ALL functions are exported
module.exports = {
  listAll,
  getById,
  add,
  showUpdateForm,
  update,
  delete: remove
};
