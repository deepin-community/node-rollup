import fs, { existsSync, promises, constants } from 'fs';
import { inspect } from 'util';
import path from 'path';

/*
© 2017-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
function chmod(mode) {
  mode = mode >= 0 ? Number(mode) : 0o755; // default: rwxr-xr-x

  let filename;
  return {
    name: 'chmod Rollup plugin',

    generateBundle(bundle, data) {
      // rollup 1.x (0.x is onwrite)
      filename = String(bundle && (bundle.file || bundle.dest) || '');
      if (!filename) throw new Error('chmod Rollup plugin.onwrite: filename missing');
    },

    writeBundle(bundle) {
      // now the outfile exists!
      fs.chmodSync(filename, mode);
    }

  };
}

/*
© 2017-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
function shebang(shebangArg) {
  shebangArg = shebangArg === true ? '#!/usr/bin/env node --experimental-modules' // Node.js 12+ ECMAScript modules
  : String(shebangArg || '#!/usr/bin/env node'); // Node.js CommonJS

  return {
    name: 'shebang Rollup plugin',
    renderChunk: code => `${shebangArg}\n${code}`
  };
}

/*
© 2019-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
const deb = console.error;
const rollupHooks = {
  /*
  in the order in which the hooks are invoked
  key: hook name
  value: object of key argument names, 1 for mandatory, 0 for optional
  */
  options: {
    inputOptions: 1
  },
  buildStart: {
    inputOptions: 1
  },
  resolveId: {
    source: 1,
    importer: 1
  },
  load: {
    id: 1
  },
  transform: {
    code: 1,
    id: 1
  },
  buildEnd: {
    error: 0
  },
  outputOptions: {
    outputOptions: 1
  },
  renderStart: {},
  banner: {},
  footer: {},
  intro: {},
  outro: {},
  renderChunk: {
    code: 1,
    chunk: 1,
    outputOptions: 1
  },
  generateBundle: {
    outputOptions: 1,
    bundle: 1,
    isWrite: 1
  },
  // the output file exists from here
  writeBundle: {
    bundle: 1
  }
};

function getHooks(hooks, shared) {
  if (!shared) shared = {};
  const {
    filename
  } = shared;
  return Object.entries(hooks).reduce((a, [hook, hookArgs]) => {
    const argNames = Object.keys(hookArgs);
    const minArgCount = Object.values(hookArgs).reduce((ac, v) => ac + v, 0);
    const maxArgCount = argNames.length;
    const argString = minArgCount === maxArgCount ? `${minArgCount}` : `${minArgCount}…${maxArgCount}`;
    return Object.assign(a, {
      [hook]: (...args) => {
        // 00 hook
        const nos = (++shared.no || (shared.no = 1)).toString();
        const no = nos.length < 2 ? `${'0'.repeat(2 - nos.length)}${nos}` : nos;
        let s = `${no} ${hook}`;
        const argCount = args.length;
        if (argCount < minArgCount || argCount > maxArgCount) s += `ARGUMENT COUNT: ${argCount} not expected: ${argString}`;

        if (hook === 'options' || hook === 'outputOptions') {
          const propertyName = hook === 'options' ? 'inputOptions' : hook;
          Object.assign(shared, {
            [propertyName]: args[0]
          });
        }

        for (let argName of argNames) {
          const v = args.shift();

          if (argName === 'inputOptions' || argName === 'outputOptions') {
            s += ` ${argName}: <see at end>`;
            continue;
          }

          const argValue = argName === 'code' ? `${String(v).substring(0, 40)}…` : argName === 'bundle' ? bundlify(v) : v;
          s += ` ${argName}: ${inspect(argValue)}`;
        }

        if (existsSync(filename)) s += `[EXISTS]`;
        deb(s);

        if (hook === 'writeBundle') {
          deb('### END:');
          const {
            inputOptions,
            outputOptions
          } = shared;
          inputOptions && deb(`inputOptions: ${inspect(shared.inputOptions)}`);
          outputOptions && deb(`outputOptions: ${inspect(shared.outputOptions)}`);
        }
      }
    });
  }, {});
}

function bundlify(bundle) {
  const result = {};

  for (let [filename, b] of Object.entries(bundle)) {
    result[filename] = b.code.length < 41 ? b : { ...b,
      code: `${b.code.substring(0, 40)}…`
    };
  }

  return result;
}

function debugPlugin(...args) {
  deb(`debugPlugin instantiated with options: ${args.length}${inspect(args)}`);
  const {
    filename
  } = Object(args[0]);
  const shared = {
    filename
  };
  return {
    name: 'debugPlugin',
    ...getHooks(rollupHooks, shared),
    // not invoked for the simple case
    augmentChunkHash: chunkInfo => deb(`augmentChunkHash chunkInfo: ${inspect(chunkInfo)}`),
    renderError: error => deb(`renderError error: ${inspect(error)}`),
    resolveDynamicImport: (specifier, importer) => deb(`resolveDynamicImport specifier: ${inspect(specifier)} importer: ${inspect(importer)}`),
    resolveFileUrl: (chunkId, fileName, format, moduleId, referenceId, relativePath) => deb(`resolveFileUrl: ${inspect({
      chunkId,
      fileName,
      format,
      moduleId,
      referenceId,
      relativePath
    })}`),
    resolveImportMeta: property => deb(`resolveImportMeta property: ${inspect(property)}`),
    watchChange: id => deb(`watchChange : ${inspect(id)}`)
  };
}

/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
const {
  access,
  stat
} = promises;
const {
  R_OK
} = constants;
class DirectoryResolver {
  constructor(options) {
    // make paths a list of absolute path names from options.path that all exist
    let {
      paths
    } = Object(options);
    if (paths === undefined) paths = [];else if (typeof paths === 'string') paths = [paths];else if (!Array.isArray(paths)) throw new Error('directoryResolver: options.path not array');

    for (let [i, p] of paths.entries()) {
      if (!existsSync(p = path.resolve(p))) throw new Error(`directoryResolver: File or directory does not exist: '${p}'`);
      paths[i] = p;
    }

    Object.assign(this, {
      paths,
      name: 'directoryResolver',
      resolveId: this.resolveId.bind(this),
      fileSuffix: ['', '.js', '.mjs', '.json'],
      dirSuffix: ['index.js', 'index.mjs', 'index.json']
    });
  }

  async resolveId(file, origin) {
    const firstChar = (file = String(file)).substring(0, 1);
    if (firstChar === '/' || firstChar === '.') return; // absolute or relative path

    return this.traversePaths(file);
  }

  async traversePaths(file) {
    for (let p of this.paths) {
      const abs = path.join(p, file);
      let f = await this.loadAsFile(abs);
      if (f) return f;
      if (!(await this.isDirectory(abs))) continue;
      if (f = await this.loadAsDirectory(abs)) return f;
    }
  }

  async loadAsFile(abs) {
    for (let suffix of this.fileSuffix) {
      const absSuff = `${abs}${suffix}`;
      if (await this.isFile(absSuff)) return absSuff;
    }
  }

  async loadAsDirectory(abs) {
    const pj = path.join(abs, 'package.json');

    if (await this.isFile(pj)) {
      const main = path.join(abs, String(Object(import(pj)).main || ''));
      console.log('loadAsDirectory main', main);
      let f = await this.loadAsFile(main);
      if (f) return f;
      if (f = await this.loadIndex(main)) return f;
    }

    return this.loadIndex(abs);
  }

  async loadIndex(abs) {
    for (let suffix of this.dirSuffix) {
      const absSuff = path.join(abs, suffix);
      if (await this.isFile(absSuff)) return absSuff;
    }
  }

  async isFile(p) {
    const stat = await this.getStat(p);
    return stat && stat.isFile();
  }

  async isDirectory(p) {
    const stat = await this.getStat(p);
    return stat && stat.isDirectory();
  }

  async getStat(p) {
    return (await this.isReadable(p)) && stat(p);
  }

  async isReadable(filename) {
    const result = await access(filename, R_OK).catch(reason => reason);
    if (!(result instanceof Error)) return true; // is readable

    if (result.code === 'ENOENT') return false; // does not exist

    throw e; // some error
  }

}

/*
© 2017-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
function directoryResolver(...args) {
  return new DirectoryResolver(...args);
}

export { DirectoryResolver, chmod, debugPlugin, directoryResolver, shebang };
