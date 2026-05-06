// gulpfile.mjs
import gulp from 'gulp';

const paths = {
  nodeSvgs: {
    src: 'nodes/**/*.svg',
    dest: 'dist/nodes',
  },
  nodeJsons: {
    src: 'nodes/**/*.json',
    dest: 'dist/nodes',
  },
};

function copyNodeSvgs() {
  return gulp.src(paths.nodeSvgs.src).pipe(gulp.dest(paths.nodeSvgs.dest));
}

function copyNodeJsons() {
  return gulp.src(paths.nodeJsons.src).pipe(gulp.dest(paths.nodeJsons.dest));
}

export const buildIcons = gulp.series(copyNodeSvgs, copyNodeJsons);

gulp.task('build:icons', buildIcons);
