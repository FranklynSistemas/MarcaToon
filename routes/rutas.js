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
router.post('/traeUser', consultas.traeUser);
router.get('/traeUsers', consultas.traeUsers);
router.post('/editarUser', consultas.editarUser);
router.get('/traeEventos', consultas.traeEventos);
router.get('/traeEvento', consultas.traeEvento);
router.post('/crearEvento', consultas.crearEvento);
router.post('/editarEvento', consultas.editarEvento);
//router.post('/creaEquipo', consultas.creaEquipo);
router.get('/traeGrupos', consultas.traeGrupos);
router.post('/agregarUser', consultas.agregarUser);
router.get('/traeEstadisticas', consultas.traeEstadisticas);

router.post('/upload',consultas.Uploads);

router.get("*", function(req, res){

	res.status(404).send("Página no encontrada :( en el momento");

});


module.exports = router;
