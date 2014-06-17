var gulp 	     = require('gulp'),
    gutil        = require('gulp-util'),
    notify       = require("gulp-notify");
    changed      = require("gulp-changed");
    fs 	         = require('fs'),
    sass         = require('gulp-ruby-sass'),
    concat       = require('gulp-concat'),
    header       = require('gulp-header'),
    jekyll 	     = require('gulp-jekyll'),
    uglify 	     = require('gulp-uglify'),
    svgmin       = require('gulp-svgmin'),
    imagemin 	 = require('gulp-imagemin'),
    debug        = require('gulp-debug'),
    serve        = require('gulp-serve'),
    autoprefixer = require('gulp-autoprefixer'),
    livereload   = require('gulp-livereload'),
	Notification = require('node-notifier'),
	Combine 	 = require('stream-combiner');
    tlr          = require('tiny-lr'),  // tiny live reload
    slr          = tlr();               // server live reload


function message(event,name)
{
    var d = new Date();
    gutil.log(d.getHours()+':'+d.getMinutes()+' - ' + gutil.colors.yellow(event.path) + ' was ' + event.type + ', running tasks...');
}     

/*
    ----- SASS -----
*/        
gulp.task('sass',function()
{
    var combined = Combine(
        gulp.src('src/sass/*.scss'),
        sass({style:'nested', loadPath:'bower_components', quiet:true,}),
        autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'),
        gulp.dest('build/css'),
        livereload(slr)
    );
    
    combined.on('error', function(err) 
    {
        Notification.Growl().notify({
            name:       "sass processor",
            title:       "Sass",
            message:    err.message,
        });
        this.emit('end');
    }); 

    return combined;       
});

/*
    ----- AUTO PREFIX -----
*/
gulp.task('autoprefix',function()
{
    return gulp.src('build/css/*.css')
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))        
        .pipe(gulp.dest('build/css'))
        .pipe(livereload(slr));
});

/*
    ----- JEKYLL -----
*/
gulp.task('jekyll',function()
{
    /* jekyll */
    return gulp.src(['build/**/*.{html,yml,md,mkd,markdown}','build/_config.yml'])
        .pipe(jekyll({
            source: './build',
            destination: '.jekyll',
            // bundleExec:true,
        }))
        .pipe(gulp.dest('.jekyll'));
});

/*
    ----- JS LIBRARIES -----
*/
gulp.task('libScripts',function()
{
    var file = fs.readFileSync('src/js/allJS.conf','utf8').trim().split('\n');    
    var src = file.filter(function(v)
    {
        if (!v) return false;
        if (v.substr(0,1) == '#') return false;   

        if (!fs.existsSync(v)) 
        {
            gutil.log(gutil.colors.red(v+' does not exist!'));
            return false;
        }
              
        return true;
    })
    gutil.log(src);

    /* javascript minify */    
    return gulp.src(src,{base:'bower_components/'})
        .pipe(uglify())  
        .pipe(header("/*! bower_components/${file.relative} */\n",{foo:'bar'}))
        .pipe(concat("all.min.js"))
        .pipe(gulp.dest('build/js'))
        .pipe(livereload(slr));
});

/*
    ----- JS FILES -----
*/
gulp.task('scripts',function()
{
    return gulp.src('src/js/**/*.js')
        // .pipe(uglify())  // put this back later - for dev I don't need it uglified.
        .pipe(changed('build/js'))
        .pipe(gulp.dest('build/js'))
        .pipe(livereload(slr));
});

/*
    ----- SVG MINIFY -----
*/
gulp.task('svg',function()
{
    return gulp.src('src/img/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('build/img'));
});

/*
    ----- BITMAPS MINIFY -----
*/
gulp.task('bitmaps',function()
{
    return gulp.src('src/img/*.{jpg,jpeg,gif,png}')
        .pipe(imagemin())
        .pipe(gulp.dest('build/img'));
});

/*
    ----- SERVER -----
*/
gulp.task('serve', serve(['.jekyll','build']));

/*
    ----- BASIC LIVERELOAD -----
*/
gulp.task('livereload',function()
{
    return gulp.src('build/**/*.{html,yml,md,mkd,markdown}')
        .pipe(changed('build/**/*.{html,yml,md,mkd,markdown}'))
        .pipe(livereload(slr));
});

/*
    ----- WATCH -----
*/
gulp.task('watch', function() {
 
    // Listen on port 35729
    slr.listen(35729, function (err) 
    {
        if (err) { return console.log(err); } 

        // Watch .scss files
        gulp.watch('src/sass/**/*.scss', ['sass']);
     
        // Watch .js files
        gulp.watch('src/js/**/*.js', ['scripts']);

        // Watch JS library conf
        gulp.watch('src/js/allJS.conf', ['libScripts']);

        // Watch bitmaps
        gulp.watch('src/img/*.{jpg,jpeg,gif,png}', ['bitmaps']);
        
        // Watch SVG
        gulp.watch('src/img/*.svg', ['svg']);

        // Watch Jekyll files
        // gulp.watch('build/**/*.{html,yml,md,mkd,markdown}', ['jekyll'])

        // watch everything else for live reload.
        gulp.watch('build/**/*.{php,html,yml,md,mkd,markdown}',['livereload'])   

    });
});

/*
    ----- DEFAULT -----
*/
gulp.task('default', function(){
    gulp.run('watch');
    gulp.run('serve');
});