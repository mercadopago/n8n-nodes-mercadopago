// gulpfile.mjs
import gulp from 'gulp';

const paths = {
  icons: {
    src: 'src/resources/icons/**/*.*',
    dest: 'dist/resources/icons',
  },
  nodeSvgs: {
    src: 'src/nodes/**/*.svg',
    dest: 'dist/nodes',
  },
  nodeJsons: {
    src: 'src/nodes/**/*.json',
    dest: 'dist/nodes',
  },
};

function copyIcons() {
  return gulp.src(paths.icons.src).pipe(gulp.dest(paths.icons.dest));
}

function copyNodeSvgs() {
  return gulp.src(paths.nodeSvgs.src).pipe(gulp.dest(paths.nodeSvgs.dest));
}

function copyNodeJsons() {
  return gulp.src(paths.nodeJsons.src).pipe(gulp.dest(paths.nodeJsons.dest));
}

export const buildIcons = gulp.series(copyIcons, copyNodeSvgs, copyNodeJsons);

gulp.task('build:icons', buildIcons);
