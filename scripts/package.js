var shell = require('shelljs');
var ncp = require('child_process');
var fs = require('fs');
var path = require('path');
var semver = require('semver');

// utils
var shellAssert = function () {
  var errMsg = shell.error();
  if (errMsg) {
      throw new Error(errMsg.toString());
  }
}

var cp = function (options, source, dest) {
  console.log(`> cp ${options} ${source} ${dest}`);

  if (dest) {
      shell.cp(options, source, dest);
  }
  else {
      shell.cp(options, source);
  }

  shellAssert();
}

var mkdir = function (options, target) {
  console.log(`> mkdir ${options} ${target}`);

  if (target) {
      shell.mkdir(options, target);
  }
  else {
      shell.mkdir(options);
  }

  shellAssert();
}

var rm = function (options, target) {
  console.log(`> rm ${options} ${target}`);

  if (target) {
      shell.rm(options, target);
  }
  else {
      shell.rm(options);
  }

  shellAssert();
}

var run = function (cl, inheritStreams) {
  console.log(`> ${cl}`);

  var options = {
      stdio: inheritStreams ? 'inherit' : 'pipe'
  };
  var rc = 0;
  var output;
  try {
      output = ncp.execSync(cl, options);
  }
  catch (err) {
      if (!inheritStreams) {
          console.error(err.output ? err.output.toString() : err.message);
      }

      process.exit(1);
  }

  return (output || '').toString().trim();
}

var test = function (options, p) {
  var result = shell.test(options, p);
  shellAssert();

  return result;
}

var minor = null;
var patch = null;
var generateVersion = function (major) {
    const ref = new Date(2000, 1, 1);
    const now = new Date();
    minor = minor || Math.floor((now - ref) / 86400000);
    patch = patch || Math.floor(Math.floor(now.getSeconds() + (60 * (now.getMinutes() + (60 * now.getHours())))) * 0.5)

    return `${major}.${minor}.${patch}`
}

// globals
var versions = ['3','4','5','6'];

// ensure clean output
console.log('clean:');

var packageDir = path.join(__dirname, '../_artifacts/package');
rm('-Rf', packageDir);
mkdir('-p', packageDir);

// bundle task & copy resources
versions.forEach(version => {
  console.log();
  console.log(`bundle task v${version}:`);

  var taskDir = path.join(__dirname, `../tasks/ReplaceTokensV${version}`);
  var binTaskDir = path.join(taskDir, 'dist');
  var packageTaskDir = path.join(packageDir, `tasks/ReplaceTokensV${version}`);

  if (!test('-d', binTaskDir)) throw new Error(`directory not found '${binTaskDir}'`);

  run(`ncc build ${binTaskDir}/index.js -o ${packageTaskDir}`);

  ['task.json'].forEach(p => {
    p = path.join(taskDir, p);
  
    cp('-Rf', p, `${packageTaskDir}/`);
  });

  cp('-Rf', path.join(__dirname, '..', 'images', 'task-icon.png'), path.join(packageTaskDir, 'icon.png'));
});

// copy extension resources
console.log();
console.log('bundle extension:');

['README.md','LICENSE','vss-extension.json'].forEach(p => {
  p = path.join(__dirname, '..', p);

  cp('-Rf', p, packageDir);
});

var packageImagesDir = path.join(packageDir, 'images');
mkdir('-p', packageImagesDir);
cp('-Rf', path.join(__dirname, '..', 'images', 'extension-icon.png'), path.join(packageImagesDir, 'icon.png'));
cp('-Rf', path.join(__dirname, '..', 'images', 'screenshot*.png'), `${packageImagesDir}/`);

// update metadata
var public = process.argv.includes('--public');
var taskId = public ? undefined : '0664FF86-F509-4392-A33C-B2D9239B9AE5';
var application = public ? undefined : 'replacetokens-task-dev';

versions.forEach(version => {
  console.log();
  console.log(`update task metadata v${version}:`);

  var packageTaskDir = path.join(packageDir, `tasks/ReplaceTokensV${version}`);

  var manifest = JSON.parse(fs.readFileSync(path.join(packageTaskDir, 'task.json')));
  var taskVersion = public
    ? `${manifest.version.Major}.${manifest.version.Minor}.${manifest.version.Patch}`
    : generateVersion(manifest.version.Major);

  manifest.version.Major = semver.major(taskVersion);
  manifest.version.Minor = semver.minor(taskVersion);
  manifest.version.Patch = semver.patch(taskVersion);
  manifest.helpMarkDown = `${manifest.helpMarkDown} (v${taskVersion})`;

  console.log(`> version: ${taskVersion}`);

  if (!public) {
    manifest.friendlyName = `${manifest.friendlyName} (dev ${taskVersion})`;

    console.log(`> friendlyName: ${manifest.friendlyName}`);
  }

  if (taskId) {
    manifest.id = taskId;

    console.log(`> id: ${manifest.id}`);
  }

  fs.writeFileSync(path.join(packageTaskDir, 'task.json'), JSON.stringify(manifest, null, 2));

  var script = fs.readFileSync(path.join(packageTaskDir, 'index.js'), { encoding: 'utf8' });
  if (application) {
    script = script.replace(/const\s+application\s*=\s*'[^']*'\s*;/, `const application = '${application}';`);

    console.log(`> application: ${application}`);
  }

  script = script.replace(/const\s+version\s*=\s*'[^']*'\s*;/, `const version = '${taskVersion}';`);

  fs.writeFileSync(path.join(packageTaskDir, 'index.js'), script);
});

console.log();
console.log('update extension metadata:');

var manifest = JSON.parse(fs.readFileSync(path.join(packageDir, 'vss-extension.json')));
var extensionVersion = public 
  ? manifest.version
  : generateVersion(semver.major(manifest.version));

manifest.version = extensionVersion;
console.log(`> version: ${extensionVersion}`);

if (!public) {
  manifest.id = `${manifest.id}-dev`;
  manifest.name = `${manifest.name} (dev)`;

  console.log(`> id: ${manifest.id}`);
  console.log(`> name: ${manifest.name}`);
}

manifest.public = public;
console.log(`> public: ${public}`);

fs.writeFileSync(path.join(packageDir, 'vss-extension.json'), JSON.stringify(manifest, null, 2));

// generate vsix
console.log();
console.log('generate vsix:');
run(`tfx extension create --root "${packageDir}" --output-path "${path.join(__dirname, '../_artifacts')}"`);