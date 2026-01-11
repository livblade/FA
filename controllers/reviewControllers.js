const db = require('../db');

/* ================= Add / Update Review ================= */
exports.addReview = (req, res) => {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.session.user.id;

    // Input validation
    if (!rating || rating < 1 || rating > 5) {
        req.flash('error', 'Please select a valid rating (1-5 stars)');
        return res.redirect(`/product/${productId}`);
    }
    
    if (!comment || comment.trim().length < 10) {
        req.flash('error', 'Review comment must be at least 10 characters');
        return res.redirect(`/product/${productId}`);
    }

    const sql = `
        INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            rating = VALUES(rating),
            comment = VALUES(comment),
            updated_at = NOW()
    `;
    
    db.query(sql, [productId, userId, rating, comment.trim()], (err) => {
        if (err) {
            console.error('Error saving review:', err);
            req.flash('error', 'Failed to save review. Please try again.');
            return res.redirect(`/product/${productId}`);
        }
        req.flash('success', 'Review submitted successfully!');
        res.redirect(`/product/${productId}`);
    });
};

/* ================= Get All Reviews for Product ================= */
exports.getReviews = (productId, callback) => {
    const sql = `
        SELECT 
            r.*, 
            u.username,
            u.profile_image,
            (
                SELECT COUNT(*)
                FROM review_helpful rh
                WHERE rh.review_id = r.review_id
            ) AS helpfulCount,
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
        ORDER BY 
            helpfulCount DESC,
            r.created_at DESC
    `;
    
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            return callback(err, []);
        }
        callback(null, results);
    });
};

/* ================= Get Average Rating ================= */
exports.getAverageRating = (productId, callback) => {
    const sql = `
        SELECT 
            COALESCE(AVG(rating), 0) AS avgRating, 
            COUNT(*) AS count
        FROM reviews
        WHERE product_id = ?
    `;
    
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching average rating:', err);
            return callback(err, { avgRating: 0, count: 0 });
        }
        callback(null, results[0]);
    });
};

/* ================= Get User's Own Review ================= */
exports.getUserReview = (productId, userId, callback) => {
    const sql = `
        SELECT * FROM reviews
        WHERE product_id = ? AND user_id = ?
        LIMIT 1
    `;
    
    db.query(sql, [productId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching user review:', err);
            return callback(err, null);
        }
        callback(null, results[0] || null);
    });
};

/* ================= Toggle Helpful ================= */
exports.toggleHelpful = (req, res) => {
    const { reviewId } = req.params;
    const userId = req.session.user.id;

    const sql = `
        INSERT INTO review_helpful (review_id, user_id, created_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            created_at = NOW()
    `;
    
    db.query(sql, [reviewId, userId], (err) => {
        if (err) {
            console.error('Error toggling helpful:', err);
            req.flash('error', 'Failed to update helpful count');
        }
        res.redirect('back');
    });
};

/* ================= Delete Helpful ================= */
exports.deleteHelpful = (req, res) => {
    const { reviewId } = req.params;
    const userId = req.session.user.id;

    const sql = 'DELETE FROM review_helpful WHERE review_id = ? AND user_id = ?';
    
    db.query(sql, [reviewId, userId], (err) => {
        if (err) {
            console.error('Error deleting helpful:', err);
            req.flash('error', 'Failed to remove helpful');
        }
        res.redirect('back');
    });
};