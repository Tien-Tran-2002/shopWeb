const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Hàm lọc theo giá và saleprice
const getPriceFilter = (minPrice, maxPrice) => {
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Number.MAX_VALUE;

    return {
        $or: [
            { saleprice: { $ne: null, $gte: min, $lte: max } }, // Nếu `saleprice` khác null
            { saleprice: { $eq: null }, price: { $gte: min, $lte: max } } // Nếu `saleprice` là null
        ]

    };
};

// Hàm lọc theo category
const getCategoryFilter = (category) => {
    if (category) {
        return { category: category };
    }
    return {};  // Nếu không có category, trả về filter rỗng
};

// Hàm xử lý sắp xếp
const getSortStage = (sort) => {
    if (sort === 'price_asc') {
        return [
            {
                $addFields: {
                    tempPrice: {
                        $cond: {
                            if: { $and: [{ $ne: ["$saleprice", null] }, { $lt: ["$saleprice", "$price"] }] },
                            then: "$saleprice",
                            else: "$price"
                        }
                    }
                }
            },
            { $sort: { tempPrice: 1 } },
            { $unset: "tempPrice" }
        ];
    } else if (sort === 'price_desc') {
        return [
            {
                $addFields: {
                    tempPrice: {
                        $cond: {
                            if: { $and: [{ $ne: ["$saleprice", null] }, { $lt: ["$saleprice", "$price"] }] },
                            then: "$saleprice",
                            else: "$price"
                        }
                    }
                }
            },
            { $sort: { tempPrice: -1 } },
            { $unset: "tempPrice" }
        ];
    } else if (sort === 'newest') {
        return [{ $sort: { createdAt: -1 } }];
    } else {
        return [];
    }
};





router.get('/store', async (req, res) => {
    const { category, minPrice, maxPrice, sort } = req.query;

    // Sử dụng hàm getCategoryFilter để lấy bộ lọc theo category
    const categoryFilter = getCategoryFilter(category);

    // Sử dụng hàm getPriceFilter để lấy bộ lọc theo giá và saleprice
    const priceFilter = getPriceFilter(minPrice, maxPrice);

    // Kết hợp cả category và price filter
    const filter = { $and: [categoryFilter, priceFilter] };

    // Sử dụng hàm getSortOption để lấy điều kiện sắp xếp
    const sortStage = getSortStage(sort);

    try {
        // Truy vấn MongoDB với bộ lọc và sắp xếp
        const products = await Product.aggregate([
            { $match: filter },
            ...sortStage
        ]);
        res.render('store', { products, category, minPrice, maxPrice, sort });
    } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
        res.status(500).send('Lỗi server');
    }
});

module.exports = router;
