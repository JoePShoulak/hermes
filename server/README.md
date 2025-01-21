# Ecommerce Backend

## Description
This application sets up the backend code for an ecommerce website. It uses MySQL and Sequelize to relate data about Products, Tags, and Categories. Addionally, Express.js is used to run a server with routes that can access and manipulate this data.

## Schema

### Models
* Category
* Product
* Tag
* ProductTag

### Associations
* Product belongs to Category
* Category has many Product models
* Product belongs to many Tag models
* Tag belongs to many Product models

## API Routes performing CRUD Operations
* product-routes.js
* tag-routes.js
* category-routes.js

## Walkthrough
[**Link to demonstration video**](https://github.com/KatyKedi/ecommerce-backend/blob/main/assets/ecommerce-backend.webm "Walkthrough video")