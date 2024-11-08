const express = require("express");
const router = express.Router();

// Require our controllers.
const user_controller = require("../controllers/userController.js");
const bucketlist_controller = require("../controllers/bucketlistController");
const bukcetlistitem_controller = require("../controllers/bucketlistitemController.js");
const agenda_controller = require("../controllers/agendaController.js");
const post_controller = require("../controllers/postController");
const login_controller = require("../controllers/loginController");

// Welcome Router
// GET welcome page
router.get('/', login_controller.welcome_get);
router.get('/login', login_controller.login_get);
router.get('/signup', login_controller.signup_get);
router.get('/home/:id', login_controller.home_user_get);
router.post('/login', login_controller.login_post);
router.post('/signup', login_controller.signup_post);
router.post('/logout', login_controller.logout);

module.exports = router;