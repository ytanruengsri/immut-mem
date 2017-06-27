const fs = require('fs');
const Immutable = require('immutable');

const isPlainObject = arg => {
    return arg === Object(arg) && Object.prototype.toString.call(arg) !== '[object Array]';
}

const isPrimitive = arg => {
  const typeOfArg = typeof arg;
  return arg == null || (typeOfArg !== "object" && typeOfArg !== "function");
};

const isString = input =>
    typeof input === 'string';

const parseJSON = (store) => {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log(`ImmutMem: cannot parse JSON, err: ${e}`);
    }
}

function ImmutMem() {
	store = Immutable.Map({});

    const _get = (key) => {
        if (typeof key !== 'string' || key === '') {
            console.log(`ImmutMem: key "${key}" is not a valid string`);
            return;
        }
        const path = key.split(':');
        return store.getIn(path);
    };

	return {
        /**
         * Load json file into the storage
         * 
         * @param {String} filePath path to the json file
         * @param {Boolean} sync option to read file synchronously
         * @memberof ImmutMem
        */
        load(filePath, sync = false) {
            if (isString(filePath)) {
                if (sync) {
                    const data = fs.readFileSync(filePath, 'utf8');
                    const cfg = parseJSON(data);
                    Object.keys(cfg).forEach(key => {
                        store = store.set(key, Immutable.fromJS(cfg[key]));
                    });
                } else {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) {
                            console.log(`ImmutMem: cannot read config from path ${filePath}`);
                            return;
                        }

                        const cfg = parseJSON(data);
                        Object.keys(cfg).forEach(key => {
                            store = store.set(key, Immutable.fromJS(cfg[key]));
                        });
                    });
                }
                
            } else if (isPlainObject(filePath)) {
                Object.keys(filePath).forEach(key => {
                    const immutValue = Immutable.fromJS(filePath[key]);
                    store = store.set(key, immutValue);
                });
            }
        },

        /**
         * Get object from specified key
         * 
         * Examples:
         * get('objA') for plain object
         * or 
         * get('objA:propA') for nested object
         * 
         * @param {String} key
         * @memberof ImmutMem
        */
        get(key) {
            const value = _get(key);
            return isPrimitive(value) ? value : value.toJS();
        },

        /**
         * Set object by specified key
         * 
         * @param {String} key 
         * @param {Object|String|Number} value
         * @memberof ImmutMem
        */
        set(key, value) {
            if (typeof key !== 'string' || key === '') {
                console.log(`ImmutMem: key "${key}" is not a valid string`);
                return;
            }

            if (!isPrimitive(value) && !isPlainObject(value)) {
                console.log(`ImmutMem: value "${value}" is not a valid value`);
                return;
            }

            const path = key.split(':');
            const immutValue = isPrimitive(value) ? value : Immutable.fromJS(value);
            store = store.setIn(path, immutValue);    
        },

        /**
         * Extend object by specified key
         * 
         * @param {String} key 
         * @param {Object|String|Number} value
         * @memberof ImmutMem
        */
        extend(key, value) {
            if (!isPlainObject(value)) {
                console.log(`ImmutMem: value "${value}" could not be extended`);
                return;
            }

            const original = _get(key);
            const extended = original.mergeDeep(Immutable.fromJS(value));
            this.set(key, extended);
        }
	};
}

module.exports = ImmutMem;
