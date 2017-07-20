const ERROR_CODES = {
    NOT_FOUND: 'NOT_FOUND'
};

const createOrUpdate = (objectType, criteria, opts, updateOnly) => {
    const _ = (resolve, reject) => (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    };
    return new Promise((resolve, reject) => {
        objectType.list((err, data) => {
            const results = data.filter(criteria);
            if (results.length === 0) {
                if (updateOnly) {
                    reject(new Error(ERROR_CODES.NOT_FOUND));
                } else {
                    objectType.create(opts, _(resolve, reject));
                }
            } else {
                results[0].update(opts, _(resolve, reject));
            }
        });
    }).then(instance => {
        console.log(`configured ${instance.constructor.name} ${instance.friendlyName}`, opts);
        return instance;
    });
};

module.exports = {
    ERROR_CODES: ERROR_CODES,
    byFriendlyName: (friendlyName) => instance => instance.friendlyName === friendlyName,
    create: (objectType, criteria, opts) => {
        return createOrUpdate(objectType, criteria, opts, false);
    },
    update: (objectType, criteria, opts) => {
        return createOrUpdate(objectType, criteria, opts, true)
    }
};
