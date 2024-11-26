const express = require("express");
const router = express.Router();

// Require our controllers.
const bucketlist_controller = require("../controllers/bucketlistController");
const agenda_controller = require("../controllers/agendaController.js");
const post_controller = require("../controllers/postController");
const login_controller = require("../controllers/loginController");

// Welcome Router
// GET welcome page
router.get('/cookie-policy', (req, res) => {
    res.render('cookie_policy', { title: 'Cookie Policy' });
});

router.get('/', login_controller.welcome_get);
router.get('/login', login_controller.login_get);
router.get('/signup', login_controller.signup_get);
router.get('/home/:id', login_controller.checkAuthenticated, login_controller.home_user_get);
router.post('/login', login_controller.login_post);
router.post('/signup', login_controller.signup_post);
router.post('/logout', login_controller.logout);

router.get('/home/:id/bucketlist', login_controller.checkAuthenticated, bucketlist_controller.bucketlist_list);
router.get('/home/:id/bucketlist/create', login_controller.checkAuthenticated, bucketlist_controller.bucketlist_create_get);
router.post('/home/:id/bucketlist', login_controller.checkAuthenticated, bucketlist_controller.bucketlist_create_post);

router.get('/home/:id/bucketlist/:id', login_controller.checkAuthenticated, bucketlist_controller.bucketlist_detail);
router.get('/home/:id/bucketlist/:id/find_items', login_controller.checkAuthenticated, bucketlist_controller.find_items_get);
router.post('/home/:id/bucketlist/:id/add_item', login_controller.checkAuthenticated, bucketlist_controller.find_items_post);

router.get('/home/:id/bucketlistitemsforpost', login_controller.checkAuthenticated, post_controller.bucketlistitem_list);
router.get('/home/:id/bucketlistitem/:itemId/posts', login_controller.checkAuthenticated, post_controller.post_list);
router.post('/home/:id/bucketlistitem/:itemId/posts', login_controller.checkAuthenticated, post_controller.post_create_post);

router.get('/home/:id/agenda', agenda_controller.agenda_get);
router.post('/agenda/add', login_controller.checkAuthenticated, agenda_controller.add_to_agenda); // New route for adding to agenda

module.exports = router;