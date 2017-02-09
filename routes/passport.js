var mongoose = require('mongoose');
var User = mongoose.model('user');
var FacebookStrategy = require('passport-facebook').Strategy;
var session = require('express-session');


var sess;

module.exports = function(passport) {
     passport.serializeUser(function(user, done) {
        done(null, user);
    });

     passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
     passport.use(new FacebookStrategy({
        clientID: '256510591443908',
        clientSecret: 'cc2942e5a34365b1b81864345fa9e257',
        callbackURL: '/auth/facebook/callback'
    }, function(accessToken, refreshToken, profile, done) {
        User.findOne({provider_id: profile.id}, function(err, user) {
            if(err) throw(err);
            if(!err && user!= null){
                return done(null, user);
                sess = user;
            };
            var user = new User({
                provider_id: profile.id,
                provider: profile.provider,
                name: profile.displayName,
                tbEstadisticaI: [],
                tbEstadisticaG: [],
                rol: 'user'
            });
            user.save(function(err) {
                if(err) throw err;
                done(null, user);
                sess = user;
                
            });
        });
    }));
}
