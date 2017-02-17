var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
require('../models/user');
require('./passport')(passport);
var consultas = require("../utils/consultas");



router.get('/', function(req, res, next) {
  res.render('indexOld');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', function(req,res,next) {
  passport.authenticate('facebook',
  { successRedirect: '/inicio',
    failureRedirect: '/' })(req,res,next);

});

router.get('/inicio', function(req, res, next) {
  if(req.user){
  	res.render('index',{user:req.user});
 }else{
  	res.render('indexOld');
  }
});

router.get('/acercade', function(req, res, next) {
    res.render('acercade');
});

router.get('/paute', function(req, res, next) {
      res.render('paute');
});

router.get('/contacto', function(req, res, next) {
  res.render('contacto');
});

router.get('/juego', function(req, res, next) {
  if(req.user){
  	res.render('juego',{user:req.user});
 }else{
  	res.render('index');
  }
});

router.get('/profile', function(req, res, next) {
if(req.user){
  if(req.user.rol != 'user'){
    res.render('profileAdmin',{
      title: 'Perfil',
      user: req.user
    });
  }else{
    res.render('profile',{
      title: 'Perfil',
      user: req.user
    });
  }
}else{
	res.render('index');
}
});

router.get('/juegoroms', function(req, res, next) {
  if(req.user){
    res.render('juegoroms',{user:req.user});
  }else{
    res.render('index');
  }
});

router.get('/eventos', function(req, res, next) {
  if(req.user){
    res.render('eventos',{user:req.user});
  }else{
    res.render('index');
  }
});

router.get('/grupos', function(req, res, next) {
  if(req.user || req.query.type == 1){
    res.render('grupos',{user:req.user,grupo:req.query.grup});
  }else{
   res.render('index');
  }
});

router.get('/agregar', function(req, res, next) {
    res.render('agregar',{token:req.query.token});
});

router.get('/gameplay',function(req, res, next) {
  if(req.user || req.query.grup != null){
    res.render('gameplay',{user:req.user,grupo:req.query.grup,partida:req.query.play});
  }else{
   res.render('index');
  }
});

router.get('/estadisticas',function(req, res, next) {
  if(req.user){
    res.render('estadisticas',{user:req.user});
  }else{
   res.render('index');
  }
});
//Consultas

router.post('/registrar', consultas.registrar);

router.post('/upload',consultas.Uploads);

router.get("*", function(req, res){

	res.status(404).send("Página no encontrada :( en el momento");

});


module.exports = router;
