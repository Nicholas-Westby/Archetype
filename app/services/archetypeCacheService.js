angular.module('umbraco.services').factory('archetypeCacheService', function (archetypePropertyEditorResource, $q) {
    //private

    var isEntityLookupLoading = false;
    var entityCache = [];

    var datatypeCache = [];

    return {
    	getDataTypeFromCache: function(guid) {
    	    var value = datatypeCache[guid];
    	    if (value) {
    	        return value.value;
            }
            return null;
    	},

    	addDatatypeToCache: function(datatype, dataTypeGuid) {
            var cachedDatatype = this.getDataTypeFromCache(dataTypeGuid);

            if(!cachedDatatype) {
            	datatype.dataTypeGuid = dataTypeGuid;
            	datatypeCache.push(datatype);
            }
    	},

        /**
         * Returns information about a data type based on the GUID for the data type.
         * @param guid The GUID for the data type.
         * @param returnPromise If true, will return the result as a promise rather than as a plain object.
         * @returns {*} The data type object, or a promise that will resolve to a data type object.
         */
		getDatatypeByGuid: function(guid, returnPromise) {
			var cachedDatatype = datatypeCache[guid];

	        if(cachedDatatype) {
                return returnPromise
                    ? (cachedDatatype.promise || $q.when(cachedDatatype.value))
                    : cachedDatatype.value;
	        }

            cachedDatatype = {
                promise: null,
                value: null
            };
	        datatypeCache[guid] = cachedDatatype;

	        //go get it from server, but this should already be pre-populated from the directive, but I suppose I'll leave this in in case used ad-hoc
            cachedDatatype.promise = archetypePropertyEditorResource.getDataType(guid).then(function(datatype) {

                datatype.dataTypeGuid = guid;

                cachedDatatype.promise = null;
                cachedDatatype.value = datatype;

                return datatype;
            });

            return returnPromise
                ? cachedDatatype.promise
                : null;

        },

     	getEntityById: function(scope, id, type) {
	        var cachedEntity = _.find(entityCache, function (e){
	            return e.id == id;
	        });

	        if(cachedEntity) {
	            return cachedEntity;
	        }

	        //go get it from server
	        if (!isEntityLookupLoading) {
	            isEntityLookupLoading = true;

	            scope.resources.entityResource.getById(id, type).then(function(entity) {

	                entityCache.push(entity);

	                isEntityLookupLoading = false;

	                return entity;
	            });
	        }

	        return null;
     	},

     	getEntityByUmbracoId: function(scope, udi, type) {
	        var cachedEntity = _.find(entityCache, function (e){
	            return e.udi == udi;
	        });

	        if(cachedEntity) {
	            return cachedEntity;
	        }

	        //go get it from server
	        if (!isEntityLookupLoading) {
	            isEntityLookupLoading = true;

	            scope.resources.entityResource.getByIds([udi], type).then(function (entities) {
                  // prevent infinite lookups with a default entity
                  var entity = entities.length > 0 ? entities[0] : { udi: udi, name: "" };

                  entityCache.push(entity);

                  isEntityLookupLoading = false;

	                return entity;
	            });
	        }

	        return null;
     	}
    }
});