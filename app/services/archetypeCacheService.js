angular.module('umbraco.services').factory('archetypeCacheService', function (archetypePropertyEditorResource, $q, entityResource) {
    //private
    var entityCache = [];
    var datatypeCache = [];
    
    return {
        initialize: function() {
            return archetypePropertyEditorResource.getAllDataTypesForCache().then(function(data) {
                datatypeCache = data;
            });
        },
        
        getDataTypeFromCache: function(guid) {
            return _.find(datatypeCache, function (dt){
                return dt.dataTypeGuid == guid;
            });
        },
 
        getDatatypeByGuid: function(guid) {
            var cachedDatatype = this.getDataTypeFromCache(guid);
            
            if(cachedDatatype) {
                return cachedDatatype;
            }

            return null;
        },

        getEntityById: function(id, type) {
            var deferred = $q.defer();
            
            var cachedEntity = _.find(entityCache, function (e){
                return e.id == id;
            });

            if(cachedEntity) {
                deferred.resolve(cachedEntity);
                
                return deferred.promise;
            }

            //go get it from server
            entityResource.getById(id, type).then(function(entity) {
                entityCache.push(entity);
                
                //console.log("entity is now resolved into cache...");
                
                deferred.resolve(entity);
            });

            return deferred.promise;
        },

        getEntityByUmbracoId: function(udi, type) {
            var deferred = $q.defer();
            
            var cachedEntity = _.find(entityCache, function (e){
                return e.udi == udi;
            });

            if(cachedEntity) {
                deferred.resolve(cachedEntity);
                
                return deferred.promise;
            }

            //go get it from server
            entityResource.getByIds([udi], type).then(function (entities) {
                // prevent infinite lookups with a default entity
                var entity = entities.length > 0 ? entities[0] : { udi: udi, name: "" };

                entityCache.push(entity);

                deferred.resolve(entity);
            });

            return deferred.promise;
        }
    }
});