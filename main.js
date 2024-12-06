/**
 * Create a PhotoShelter API client
 * @param {string} apiKey - Your PhotoShelter API key

 */
export function PhotoShelterV4API(apiKey) {
  const baseUrl = "https://www.photoshelter.com/psapi/v4.0";
  let authToken = null,
    org = null,
    isTwoFactor = null;

  const handleErrors = async (response, location) => {
    if (response.status == "404") {
      throw new Error(
        `Request Failed. Request Response: ${location} = ${response.statusText}`
      );
    }
    const json = await response.json();
    const msg = json.errors
      .map((e) => e.title)
      .filter(Boolean)
      .join(" | ");
    throw new Error(`Request Failed. Request Response: ${location} = ${msg}`);
  };

  const responseType = async (response) => {
    const clone = response.clone();
    try {
      return await response.json();
    } catch (error) {
      return await clone.arrayBuffer();
    }
  };

  /**
   * Make an authenticated request to the PhotoShelter API
   * @param {string} endpoint - The API endpoint
   * @param {Object} params - The query parameters
   * @param {Object} [options] - Optional fetch options (e.g., method, headers)
   * @returns {Promise<Object>} - The API response
   */
  const request = async (endpoint, params = {}, options = {}) => {
    if (!authToken) {
      throw new Error("No auth token. Make sure to authenticate.login() first");
    }
    options.headers = {
      ...options.headers,
      "X-PS-Auth-Token": authToken,
      "X-PS-API-Key": apiKey,
      "Content-Type": "application/json",
    };

    const url = new URL(`${baseUrl}${endpoint}`);
    const searchParams = new URLSearchParams(params);

    url.search = searchParams.toString();

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        return await handleErrors(response, endpoint);
      }

      return await responseType(response);
    } catch (error) {
      throw error;
    }
  };

  const toForm = (obj) => {
    return Object.keys(obj)
      .map((key) =>
        obj[key]
          ? `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
          : ""
      )
      .filter(Boolean)
      .join("&");
  };

  // Authentication Endpoints
  const authenticate = {
    /**
     * Authenticate user and get a token
     * @param {string} email - Email
     * @param {string} password - Password
     * @param {string} [orgId] - [Optional] Your organization ID
     * @returns {Promise}
     * @throws Throws an error if not ok status
     */
    login: async (email, password, orgId) => {
      try {
        const body = toForm({ email, password, mode: "token", org_id: orgId });
        const response = await fetch(`${baseUrl}/authenticate`, {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "X-PS-Api-Key": apiKey,
          },
          body,
        });

        if (!response.ok) {
          return await handleErrors(response, "login");
        }
        const json = await responseType(response);
        authToken = json.token;
        org = json.org;
        isTwoFactor = json.two_factor;
      } catch (error) {
        throw error;
      }
    },
  };

  /**
   * Collection Endpoints
   * @namespace collections
   */
  const collections = {
    /**
     * Get all collections
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The collections information
     */
    getAll: async (params = {}) => await request("/collections", params),

    /**
     * Get a specific collection by ID
     * @param {string} id - The ID of the collection
     * @returns {Promise<Object>} - The collection information
     */
    getById: async (id) => await request(`/collections/${id}`),

    /**
     * Search collections
     * @param {Object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The search results
     */
    search: async (params) => await request("/collections/search", params),

    /**
     * Create a new collection
     * @param {Object} params - Collection parameters
     * @param {string} params.name - Collection name
     * @param {string} [params.description] - Collection description
     * @returns {Promise<Object>} - The created collection information
     */
    create: async (params) =>
      await request("/collections", params, { method: "POST" }),

    /**
     * Update an existing collection
     * @param {string} id - The ID of the collection
     * @param {Object} params - Collection parameters
     * @param {string} [params.name] - Collection name
     * @param {string} [params.description] - Collection description
     * @returns {Promise<Object>} - The updated collection information
     */
    update: async (id, params) =>
      await request(`/collections/${id}`, params, { method: "PATCH" }),

    /**
     * Delete a collection
     * @param {string} id - The ID of the collection
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/collections/${id}`, {}, { method: "DELETE" }),

    /**
     * Get the children of a collection
     * @param {string} id - The ID of the collection
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The children information
     */
    getChildren: async (id, params = {}) =>
      await request(`/collections/${id}/children`, params),

    /**
     * Get the child count of a collection
     * @param {string} id - The ID of the collection
     * @returns {Promise<Object>} - The child count information
     */
    getChildCount: async (id) => await request(`/collections/${id}/count`),

    /**
     * Get the key image of a collection
     * @param {string} id - The ID of the collection
     * @returns {Promise<Object>} - The key image information
     */
    getKeyImage: async (id) => await request(`/collections/${id}/key_image`),

    /**
     * Get the link to a collection
     * @param {string} id - The ID of the collection
     * @returns {Promise<Object>} - The link information
     */
    getLink: async (id) => await request(`/collections/${id}/link`),

    /**
     * Get the access (visibility) of a collection
     * @param {string} id - The ID of the collection
     * @returns {Promise<Object>} - The access information
     */
    getAccess: async (id) => await request(`/collections/${id}/access`),

    /**
     * Get a specific child of a collection
     * @param {string} id - The ID of the collection
     * @param {string} childId - The ID of the child
     * @returns {Promise<Object>} - The child information
     */
    getChildById: async (id, childId) =>
      await request(`/collections/${id}/children/${childId}`),

    /**
     * Get the access rights (permissions) of a collection
     * @param {string} id - The ID of the collection
     * @returns {Promise<Object>} - The permissions information
     */
    getPermissions: async (id) =>
      await request(`/collections/${id}/permissions`),

    /**
     * Get the parent of a collection
     * @param {string} id - The ID of the collection
     * @returns {Promise<Object>} - The parent information
     */
    getParent: async (id) => await request(`/collections/${id}/parent`),

    /**
     * Get the breadcrumb path of a collection
     * @param {string} id - The ID of the collection
     * @returns {Promise<Object>} - The breadcrumb path information
     */
    getPath: async (id) => await request(`/collections/${id}/path`),
  };

  /**
   * Contact Endpoints
   * @namespace contacts
   */
  const contacts = {
    /**
     * Search for contacts and contact groups
     * @param {Object} params - Search parameters
     * @param {string} [params.query] - Search query
     * @param {string} [params.email] - Filter by email
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The search results
     */
    search: async (params = {}) => await request("/contacts", params),

    /**
     * Get a specific contact by ID
     * @param {string} id - The ID of the contact
     * @returns {Promise<Object>} - The contact information
     */
    getById: async (id) => await request(`/contacts/${id}`),
  };

  /**
   * Embed Token Endpoints
   * @namespace embedTokens
   */
  const embedTokens = {
    /**
     * List all embed tokens
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The list of embed tokens
     */
    getAll: async (params = {}) => await request("/embed-tokens", params),

    /**
     * Create an embed token
     * @param {Object} data - Embed token data
     * @param {string} data.name - The name of the token
     * @param {string} [data.description] - The description of the token
     * @returns {Promise<Object>} - The created embed token information
     */
    create: async (data) =>
      await request("/embed-tokens", data, { method: "POST" }),

    /**
     * Get a specific embed token by ID
     * @param {string} id - The ID of the embed token
     * @returns {Promise<Object>} - The embed token information
     */
    getById: async (id) => await request(`/embed-tokens/${id}`),

    /**
     * Update an embed token by ID
     * @param {string} id - The ID of the embed token
     * @param {Object} data - Embed token data
     * @param {string} [data.name] - The name of the token
     * @param {string} [data.description] - The description of the token
     * @returns {Promise<Object>} - The updated embed token information
     */
    updateById: async (id, data) =>
      await request(`/embed-tokens/${id}`, data, { method: "PATCH" }),

    /**
     * Delete an embed token by ID
     * @param {string} id - The ID of the embed token
     * @returns {Promise<Object>} - The delete response
     */
    deleteById: async (id) =>
      await request(`/embed-tokens/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Face Endpoints
   * @namespace faces
   */
  const faces = {
    /**
     * Add a new face image to a person
     * @param {Object} data - Face data
     * @param {File} data.file - Image file of the face
     * @param {string} data.person_id - The ID of the person
     * @returns {Promise<Object>} - The created face information
     */
    add: async (data) =>
      await request("/faces", data, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),

    /**
     * Get a specific face by ID
     * @param {string} id - The ID of the face
     * @param {Object} params - Query parameters
     * @param {string} [params.include] - Include related resources of the primary resource
     * @returns {Promise<Object>} - The face information
     */
    getById: async (id, params = {}) => await request(`/faces/${id}`, params),

    /**
     * Update a face by ID
     * @param {string} id - The ID of the face
     * @param {Object} data - Face data
     * @param {string} data.person_id - The ID of the person
     * @returns {Promise<Object>} - The updated face information
     */
    updateById: async (id, data) =>
      await request(`/faces/${id}`, data, {
        method: "PATCH",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),

    /**
     * Delete a face by ID
     * @param {string} id - The ID of the face
     * @returns {Promise<Object>} - The delete response
     */
    deleteById: async (id) =>
      await request(`/faces/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Gallery Endpoints
   * @namespace galleries
   */
  const galleries = {
    /**
     * Get all galleries
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The galleries information
     */
    getAll: async (params = {}) => await request("/galleries", params),

    /**
     * Get a specific gallery by ID
     * @param {string} id - The ID of the gallery
     * @returns {Promise<Object>} - The gallery information
     */
    getById: async (id) => await request(`/galleries/${id}`),

    /**
     * Create a gallery
     * @param {Object} data - The gallery data
     * @param {string} data.name - The name of the gallery
     * @param {string} [data.description] - The description of the gallery
     * @param {boolean} [data.is_public] - Whether the gallery is public
     * @returns {Promise<Object>} - The created gallery information
     */
    create: async (data) =>
      await request("/galleries", data, { method: "POST" }),

    /**
     * Batch update galleries
     * @param {Object} data - The gallery data
     * @param {string[]} data.gallery_ids - Array of gallery IDs to be updated
     * @param {Object} [data.updates] - Updates to apply to the galleries
     * @returns {Promise<Object>} - The updated galleries information
     */
    batchUpdate: async (data) =>
      await request("/galleries/batch", data, { method: "PATCH" }),

    /**
     * Update a gallery by ID
     * @param {string} id - The ID of the gallery
     * @param {Object} data - The updated gallery data
     * @returns {Promise<Object>} - The updated gallery information
     */
    updateById: async (id, data) =>
      await request(`/galleries/${id}`, data, { method: "PATCH" }),

    /**
     * Delete a gallery by ID
     * @param {string} id - The ID of the gallery
     * @returns {Promise<Object>} - The delete response
     */
    deleteById: async (id) =>
      await request(`/galleries/${id}`, {}, { method: "DELETE" }),

    /**
     * Get the access (visibility) of a gallery
     * @param {string} id - The ID of the gallery
     * @returns {Promise<Object>} - The access information
     */
    getAccessById: async (id) => await request(`/galleries/${id}/access`),

    /**
     * Get the child count of a gallery
     * @param {string} id - The ID of the gallery
     * @returns {Promise<Object>} - The child count information
     */
    getChildCountById: async (id) => await request(`/galleries/${id}/count`),

    /**
     * Get the children of a gallery
     * @param {string} id - The ID of the gallery
     * @returns {Promise<Object>} - The children information
     */
    getChildrenById: async (id) => await request(`/galleries/${id}/children`),

    /**
     * Add a child to a gallery
     * @param {string} id - The ID of the gallery
     * @param {Object} data - The child data
     * @returns {Promise<Object>} - The updated gallery information
     */
    addChildById: async (id, data) =>
      await request(`/galleries/${id}/children`, data, { method: "POST" }),

    /**
     * Remove a child from a gallery
     * @param {string} id - The ID of the gallery
     * @param {string} childId - The ID of the child to be removed
     * @returns {Promise<Object>} - The updated gallery information
     */
    removeChildById: async (id, childId) =>
      await request(
        `/galleries/${id}/children/${childId}`,
        {},
        { method: "DELETE" }
      ),

    /**
     * Get a specific child from a gallery
     * @param {string} id - The ID of the gallery
     * @param {string} childId - The ID of the child
     * @returns {Promise<Object>} - The child information
     */
    getChildById: async (id, childId) =>
      await request(`/galleries/${id}/children/${childId}`),

    /**
     * Update the media in a gallery
     * @param {string} id - The ID of the gallery
     * @param {Object} data - The media data
     * @returns {Promise<Object>} - The updated gallery information
     */
    updateMedia: async (id, data) =>
      await request(`/galleries/${id}/media`, data, { method: "PATCH" }),

    /**
     * Get the cover of a gallery
     * @param {string} id - The ID of the gallery
     * @returns {Promise<Object>} - The cover information
     */
    getCoverById: async (id) => await request(`/galleries/${id}/cover`),

    /**
     * Get the key image of a gallery
     * @param {string} id - The ID of the gallery
     * @returns {Promise<Object>} - The key image information
     */
    getKeyImageById: async (id) => await request(`/galleries/${id}/key_image`),

    /**
     * Update the key image of a gallery
     * @param {string} id - The ID of the gallery
     * @param {Object} data - The key image data
     * @returns {Promise<Object>} - The updated key image information
     */
    updateKeyImageById: async (id, data) =>
      await request(`/galleries/${id}/key_image`, data, { method: "PATCH" }),

    /**
     * Get the link of a gallery
     * @param {string} id - The ID of the gallery
     * @returns {Promise<Object>} - The link information
     */
    getLinkById: async (id) => await request(`/galleries/${id}/link`),

    /**
     * Get the parents of a gallery
     * @param {string} id - The ID of the gallery
     * @returns {Promise<Object>} - The parents information
     */
    getParentsById: async (id) => await request(`/galleries/${id}/parents`),

    /**
     * Add a parent to a gallery
     * @param {string} id - The ID of the gallery
     * @param {Object} data - The parent data
     * @returns {Promise<Object>} - The updated gallery information
     */
    addParentById: async (id, data) =>
      await request(`/galleries/${id}/parents`, data, { method: "POST" }),

    /**
     * Remove a parent from a gallery
     * @param {string} id - The ID of the gallery
     * @param {string} parentId - The ID of the parent to be removed
     * @returns {Promise<Object>} - The updated gallery information
     */
    removeParentById: async (id, parentId) =>
      await request(
        `/galleries/${id}/parents/${parentId}`,
        {},
        { method: "DELETE" }
      ),

    /**
     * Get the breadcrumb path of a gallery
     * @param {string} id - The ID of the gallery
     * @returns {Promise<Object>} - The breadcrumb path information
     */
    getPathById: async (id) => await request(`/galleries/${id}/path`),
  };

  const info = {
    authToken,
    org,
    isTwoFactor,
  };

  /**
   * Integrations Endpoints
   * @namespace integrations
   */
  const integrations = {
    /**
     * List integration information
     * @returns {Promise<Object>} - List of integration information
     */
    list: async () => await request("/integrations"),
  };

  /**
   * Library Endpoints
   * @namespace library
   */
  const library = {
    /**
     * Retrieve library listing
     * @param {Object} params - Query parameters
     * @param {boolean} [params.is_listed] - Filter by listed or unlisted
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The library listing
     */
    getAll: async (params = {}) => await request("/library", params),
  };

  /**
   * Media Endpoints
   * @namespace media
   */
  const media = {
    /**
     * Retrieve a list of media
     * @param {Object} params - Query parameters
     * @param {string} [params.query] - Search query
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The media information
     */
    getAll: async (params = {}) => await request("/media", params),

    /**
     * Create a new media
     * @param {Object} data - Media data
     * @returns {Promise<Object>} - The created media information
     */
    create: async (data) => await request("/media", data, { method: "POST" }),

    /**
     * Batch update media
     * @param {Object} data - Media data
     * @returns {Promise<Object>} - The updated media information
     */
    batchUpdate: async (data) =>
      await request("/media/batch", data, { method: "PATCH" }),

    /**
     * Batch download media
     * @param {Object} params - Download parameters
     * @returns {Promise<Object>} - The download response
     */
    batchDownload: async (params) =>
      await request("/media/batch/download", params),

    /**
     * Batch get a set of media download options
     * @param {Object} params - Download options parameters
     * @returns {Promise<Object>} - The download options response
     */
    getBatchDownloadOptions: async (params) =>
      await request("/media/batch/download/options", params),

    /**
     * Batch update media metadata (Video only)
     * @param {Object} data - Metadata data
     * @returns {Promise<Object>} - The updated metadata information
     */
    batchUpdateMetadata: async (data) =>
      await request("/media/batch/metadata", data, { method: "PATCH" }),

    /**
     * Get a specific media by ID
     * @param {string} id - The ID of the media
     * @returns {Promise<Object>} - The media information
     */
    getById: async (id) => await request(`/media/${id}`),

    /**
     * Update a media by ID
     * @param {string} id - The ID of the media
     * @param {Object} data - Media data
     * @returns {Promise<Object>} - The updated media information
     */
    updateById: async (id, data) =>
      await request(`/media/${id}`, data, { method: "PATCH" }),

    /**
     * Delete a media by ID
     * @param {string} id - The ID of the media
     * @returns {Promise<Object>} - The delete response
     */
    deleteById: async (id) =>
      await request(`/media/${id}`, {}, { method: "DELETE" }),

    /**
     * Get custom metadata of a media (Image only)
     * @param {string} id - The ID of the image
     * @returns {Promise<Object>} - The custom metadata information
     */
    getCustomMetadataById: async (id) =>
      await request(`/media/${id}/custom_metadata`),

    /**
     * Download media
     * @param {string} id - The ID of the media
     * @param {Object} params - Download parameters
     * @returns {Promise<Object>} - The download response
     */
    downloadById: async (id, params = {}) =>
      await request(`/media/${id}/download`, params),

    /**
     * Download and transform media
     * @param {string} id - The ID of the media
     * @param {Object} params - Transform parameters
     * @returns {Promise<Object>} - The download response
     */
    downloadTransformById: async (id, params = {}) =>
      await request(`/media/${id}/download/transform`, params),

    /**
     * Get galleries for a media
     * @param {string} id - The ID of the media
     * @returns {Promise<Object>} - The galleries information
     */
    getGalleriesById: async (id) => await request(`/media/${id}/galleries`),

    /**
     * Get EXIF data of a media
     * @param {string} id - The ID of the image
     * @returns {Promise<Object>} - The EXIF data
     */
    getExifById: async (id) => await request(`/media/${id}/exif`),

    /**
     * Get IPTC data of a media
     * @param {string} id - The ID of the image
     * @returns {Promise<Object>} - The IPTC data
     */
    getIptcById: async (id) => await request(`/media/${id}/iptc`),

    /**
     * Update IPTC data of a media
     * @param {string} id - The ID of the image
     * @param {Object} data - IPTC data
     * @returns {Promise<Object>} - The updated IPTC data
     */
    updateIptcById: async (id, data) =>
      await request(`/media/${id}/iptc`, data, { method: "PATCH" }),

    /**
     * Get link of a media
     * @param {string} id - The ID of the media
     * @returns {Promise<Object>} - The link information
     */
    getLinkById: async (id) => await request(`/media/${id}/link`),

    /**
     * Get metadata of a media
     * @param {string} id - The ID of the media
     * @returns {Promise<Object>} - The metadata information
     */
    getMetadataById: async (id) => await request(`/media/${id}/metadata`),

    /**
     * Update metadata of a media
     * @param {string} id - The ID of the media
     * @param {Object} data - Metadata data
     * @returns {Promise<Object>} - The updated metadata information
     */
    updateMetadataById: async (id, data) =>
      await request(`/media/${id}/metadata`, data, { method: "PATCH" }),

    /**
     * Get machine learning metadata of a media
     * @param {string} id - The ID of the media
     * @returns {Promise<Object>} - The machine learning metadata information
     */
    getMlMetadataById: async (id) => await request(`/media/${id}/ml_metadata`),

    /**
     * Update machine learning metadata of a media
     * @param {string} id - The ID of the media
     * @param {Object} data - Machine learning metadata data
     * @returns {Promise<Object>} - The updated machine learning metadata information
     */
    updateMlMetadataById: async (id, data) =>
      await request(`/media/${id}/ml_metadata`, data, { method: "PATCH" }),

    /**
     * Get XMP data of a media
     * @param {string} id - The ID of the image
     * @returns {Promise<Object>} - The XMP data
     */
    getXmpById: async (id) => await request(`/media/${id}/xmp`),

    /**
     * Update XMP data of a media
     * @param {string} id - The ID of the image
     * @param {Object} data - XMP data
     * @returns {Promise<Object>} - The updated XMP data
     */
    updateXmpById: async (id, data) =>
      await request(`/media/${id}/xmp`, data, { method: "PATCH" }),

    /**
     * Upload a subtitle/caption
     * @param {string} id - The ID of the video
     * @param {Object} data - Subtitle data
     * @returns {Promise<Object>} - The upload response
     */
    uploadSubtitleById: async (id, data) =>
      await request(`/media/${id}/subtitle`, data, { method: "POST" }),

    /**
     * Update a subtitle/caption
     * @param {string} id - The ID of the video
     * @param {string} subtitleId - The ID of the subtitle
     * @param {Object} data - Subtitle data
     * @returns {Promise<Object>} - The updated subtitle information
     */
    updateSubtitleById: async (id, subtitleId, data) =>
      await request(`/media/${id}/subtitle/${subtitleId}`, data, {
        method: "PATCH",
      }),
  };

  /**
   * Media Versions Endpoints
   * @namespace mediaVersions
   */
  const mediaVersions = {
    /**
     * Get all versions for a given media ID
     * @param {string} mediaId - The ID of the media
     * @param {Object} [params] - Query parameters
     * @param {string} [params.include] - Include additional information
     * @returns {Promise<Object>} - The list of media versions
     */
    getAll: async (mediaId, params = {}) =>
      await request(`/media/${mediaId}/versions`, params),

    /**
     * Create a new version for a given media ID
     * @param {string} mediaId - The ID of the media
     * @param {Object} data - Media version parameters
     * @param {string} data.version_label - Label for the new version
     * @param {string} [data.note] - Note for the new version
     * @returns {Promise<Object>} - The created media version information
     */
    create: async (mediaId, data) =>
      await request(`/media/${mediaId}/versions`, data, { method: "POST" }),

    /**
     * Update a specific media version by ID
     * @param {string} mediaId - The ID of the media
     * @param {string} versionId - The ID of the media version
     * @param {Object} data - Media version parameters
     * @param {string} [data.version_label] - Label for the version
     * @param {string} [data.note] - Note for the version
     * @returns {Promise<Object>} - The updated media version information
     */
    update: async (mediaId, versionId, data) =>
      await request(`/media/${mediaId}/versions/${versionId}`, data, {
        method: "PUT",
      }),

    /**
     * Delete a specific media version by ID
     * @param {string} mediaId - The ID of the media
     * @param {string} versionId - The ID of the media version
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (mediaId, versionId) =>
      await request(
        `/media/${mediaId}/versions/${versionId}`,
        {},
        { method: "DELETE" }
      ),

    /**
     * Update media version details by ID
     * @param {string} mediaId - The ID of the media
     * @param {string} versionId - The ID of the media version
     * @param {Object} data - Media version parameters
     * @returns {Promise<Object>} - The updated media version information
     */
    updateDetails: async (mediaId, versionId, data) =>
      await request(`/media/${mediaId}/versions/${versionId}/details`, data, {
        method: "PUT",
      }),

    /**
     * Activate a media version by ID
     * @param {string} mediaId - The ID of the media
     * @param {string} versionId - The ID of the media version
     * @returns {Promise<Object>} - The activation response
     */
    activate: async (mediaId, versionId) =>
      await request(
        `/media/${mediaId}/versions/${versionId}/activate`,
        {},
        { method: "POST" }
      ),
  };

  /**
   * Machine Learning Metadata Endpoints
   * @namespace mlMetadata
   */
  const mlMetadata = {
    /**
     * Get all machine learning metadata
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The machine learning metadata information
     */
    getAll: async (params = {}) => await request("/ml-metadata", params),

    /**
     * Get a specific machine learning metadata by ID
     * @param {string} id - The ID of the machine learning metadata
     * @returns {Promise<Object>} - The machine learning metadata information
     */
    getById: async (id) => await request(`/ml-metadata/${id}`),

    /**
     * Create a new machine learning metadata
     * @param {Object} params - Machine learning metadata parameters
     * @param {string} params.name - Machine learning metadata name
     * @param {string} params.description - Machine learning metadata description
     * @returns {Promise<Object>} - The created machine learning metadata information
     */
    create: async (params) =>
      await request("/ml-metadata", params, { method: "POST" }),

    /**
     * Update an existing machine learning metadata
     * @param {string} id - The ID of the machine learning metadata
     * @param {Object} params - Machine learning metadata parameters
     * @param {string} [params.name] - Machine learning metadata name
     * @param {string} [params.description] - Machine learning metadata description
     * @returns {Promise<Object>} - The updated machine learning metadata information
     */
    update: async (id, params) =>
      await request(`/ml-metadata/${id}`, params, { method: "PUT" }),

    /**
     * Delete a machine learning metadata
     * @param {string} id - The ID of the machine learning metadata
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/ml-metadata/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Metadata Endpoints
   * @namespace metadata
   */
  const metadata = {
    /**
     * Get all metadata fields
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The metadata information
     */
    getAllFields: async (params = {}) =>
      await request("/metadata/fields", params),

    /**
     * Get a specific metadata field by ID
     * @param {string} id - The ID of the metadata field
     * @returns {Promise<Object>} - The metadata field information
     */
    getFieldById: async (id) => await request(`/metadata/fields/${id}`),

    /**
     * Create a new metadata field
     * @param {Object} params - Metadata field parameters
     * @param {string} params.name - Metadata field name
     * @param {string} params.description - Metadata field description
     * @returns {Promise<Object>} - The created metadata field information
     */
    createField: async (params) =>
      await request("/metadata/fields", params, { method: "POST" }),

    /**
     * Update an existing metadata field
     * @param {string} id - The ID of the metadata field
     * @param {Object} params - Metadata field parameters
     * @param {string} [params.name] - Metadata field name
     * @param {string} [params.description] - Metadata field description
     * @returns {Promise<Object>} - The updated metadata field information
     */
    updateField: async (id, params) =>
      await request(`/metadata/fields/${id}`, params, { method: "PUT" }),

    /**
     * Delete a metadata field
     * @param {string} id - The ID of the metadata field
     * @returns {Promise<Object>} - The delete response
     */
    deleteField: async (id) =>
      await request(`/metadata/fields/${id}`, {}, { method: "DELETE" }),

    /**
     * Get all metadata schemas
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The metadata schemas information
     */
    getAllSchemas: async (params = {}) =>
      await request("/metadata/schemas", params),

    /**
     * Get a specific metadata schema by ID
     * @param {string} id - The ID of the metadata schema
     * @returns {Promise<Object>} - The metadata schema information
     */
    getSchemaById: async (id) => await request(`/metadata/schemas/${id}`),

    /**
     * Create a new metadata schema
     * @param {Object} params - Metadata schema parameters
     * @param {string} params.name - Metadata schema name
     * @param {string} params.description - Metadata schema description
     * @returns {Promise<Object>} - The created metadata schema information
     */
    createSchema: async (params) =>
      await request("/metadata/schemas", params, { method: "POST" }),

    /**
     * Update an existing metadata schema
     * @param {string} id - The ID of the metadata schema
     * @param {Object} params - Metadata schema parameters
     * @param {string} [params.name] - Metadata schema name
     * @param {string} [params.description] - Metadata schema description
     * @returns {Promise<Object>} - The updated metadata schema information
     */
    updateSchema: async (id, params) =>
      await request(`/metadata/schemas/${id}`, params, { method: "PUT" }),

    /**
     * Delete a metadata schema
     * @param {string} id - The ID of the metadata schema
     * @returns {Promise<Object>} - The delete response
     */
    deleteSchema: async (id) =>
      await request(`/metadata/schemas/${id}`, {}, { method: "DELETE" }),

    /**
     * Get all metadata values
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The metadata values information
     */
    getAllValues: async (params = {}) =>
      await request("/metadata/values", params),

    /**
     * Get a specific metadata value by ID
     * @param {string} id - The ID of the metadata value
     * @returns {Promise<Object>} - The metadata value information
     */
    getValueById: async (id) => await request(`/metadata/values/${id}`),

    /**
     * Create a new metadata value
     * @param {Object} params - Metadata value parameters
     * @param {string} params.field_id - ID of the associated metadata field
     * @param {string} params.value - Metadata value
     * @returns {Promise<Object>} - The created metadata value information
     */
    createValue: async (params) =>
      await request("/metadata/values", params, { method: "POST" }),

    /**
     * Update an existing metadata value
     * @param {string} id - The ID of the metadata value
     * @param {Object} params - Metadata value parameters
     * @param {string} [params.field_id] - ID of the associated metadata field
     * @param {string} [params.value] - Metadata value
     * @returns {Promise<Object>} - The updated metadata value information
     */
    updateValue: async (id, params) =>
      await request(`/metadata/values/${id}`, params, { method: "PUT" }),

    /**
     * Delete a metadata value
     * @param {string} id - The ID of the metadata value
     * @returns {Promise<Object>} - The delete response
     */
    deleteValue: async (id) =>
      await request(`/metadata/values/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * OAuth Endpoints
   * @namespace oauth
   */
  const oauth = {
    /**
     * Authorize OAuth
     * @param {Object} params - OAuth parameters
     * @param {string} params.client_id - Client ID
     * @param {string} params.redirect_uri - Redirect URI
     * @param {string} params.response_type - Response type
     * @param {string} params.scope - Scope
     * @returns {Promise<Object>} - The authorization response
     */
    authorize: async (params) => await request("/oauth/authorize", params),

    /**
     * Get OAuth token
     * @param {Object} params - OAuth parameters
     * @param {string} params.client_id - Client ID
     * @param {string} params.client_secret - Client secret
     * @param {string} params.code - Authorization code
     * @param {string} params.redirect_uri - Redirect URI
     * @param {string} params.grant_type - Grant type
     * @returns {Promise<Object>} - The token response
     */
    token: async (params) => await request("/oauth/token", params),
  };

  /**
   * Organization Endpoints
   * @namespace organization
   */
  const organization = {
    /**
     * Get all organizations
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The organizations information
     */
    getAll: async (params = {}) => await request("/organization", params),

    /**
     * Get a specific organization by ID
     * @param {string} id - The ID of the organization
     * @returns {Promise<Object>} - The organization information
     */
    getById: async (id) => await request(`/organization/${id}`),

    /**
     * Create a new organization
     * @param {Object} params - Organization parameters
     * @param {string} params.name - Organization name
     * @param {string} params.description - Organization description
     * @returns {Promise<Object>} - The created organization information
     */
    create: async (params) =>
      await request("/organization", params, { method: "POST" }),

    /**
     * Update an existing organization
     * @param {string} id - The ID of the organization
     * @param {Object} params - Organization parameters
     * @param {string} [params.name] - Organization name
     * @param {string} [params.description] - Organization description
     * @returns {Promise<Object>} - The updated organization information
     */
    update: async (id, params) =>
      await request(`/organization/${id}`, params, { method: "PUT" }),

    /**
     * Delete an organization
     * @param {string} id - The ID of the organization
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/organization/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * People Endpoints
   * @namespace people
   */
  const people = {
    /**
     * Get all people
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The people information
     */
    getAll: async (params = {}) => await request("/people", params),

    /**
     * Get a specific person by ID
     * @param {string} id - The ID of the person
     * @returns {Promise<Object>} - The person information
     */
    getById: async (id) => await request(`/people/${id}`),

    /**
     * Create a new person
     * @param {Object} params - Person parameters
     * @param {string} params.name - Person name
     * @param {string} [params.description] - Person description
     * @returns {Promise<Object>} - The created person information
     */
    create: async (params) =>
      await request("/people", params, { method: "POST" }),

    /**
     * Update an existing person
     * @param {string} id - The ID of the person
     * @param {Object} params - Person parameters
     * @param {string} [params.name] - Person name
     * @param {string} [params.description] - Person description
     * @returns {Promise<Object>} - The updated person information
     */
    update: async (id, params) =>
      await request(`/people/${id}`, params, { method: "PUT" }),

    /**
     * Delete a person
     * @param {string} id - The ID of the person
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/people/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Portal Endpoints
   * @namespace portal
   */
  const portal = {
    /**
     * Get all portal items
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The portal items information
     */
    getAll: async (params = {}) => await request("/portal", params),

    /**
     * Get a specific portal item by ID
     * @param {string} id - The ID of the portal item
     * @returns {Promise<Object>} - The portal item information
     */
    getById: async (id) => await request(`/portal/${id}`),

    /**
     * Create a new portal item
     * @param {Object} params - Portal item parameters
     * @param {string} params.name - Portal item name
     * @param {string} params.description - Portal item description
     * @returns {Promise<Object>} - The created portal item information
     */
    create: async (params) =>
      await request("/portal", params, { method: "POST" }),

    /**
     * Update an existing portal item
     * @param {string} id - The ID of the portal item
     * @param {Object} params - Portal item parameters
     * @param {string} [params.name] - Portal item name
     * @param {string} [params.description] - Portal item description
     * @returns {Promise<Object>} - The updated portal item information
     */
    update: async (id, params) =>
      await request(`/portal/${id}`, params, { method: "PUT" }),

    /**
     * Delete a portal item
     * @param {string} id - The ID of the portal item
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/portal/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Permissions Endpoints
   * @namespace permissions
   */
  const permissions = {
    /**
     * Get all permissions
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The permissions information
     */
    getAll: async (params = {}) => await request("/permissions", params),

    /**
     * Get a specific permission by ID
     * @param {string} id - The ID of the permission
     * @returns {Promise<Object>} - The permission information
     */
    getById: async (id) => await request(`/permissions/${id}`),

    /**
     * Create a new permission
     * @param {Object} params - Permission parameters
     * @param {string} params.name - Permission name
     * @param {string} params.description - Permission description
     * @returns {Promise<Object>} - The created permission information
     */
    create: async (params) =>
      await request("/permissions", params, { method: "POST" }),

    /**
     * Update an existing permission
     * @param {string} id - The ID of the permission
     * @param {Object} params - Permission parameters
     * @param {string} [params.name] - Permission name
     * @param {string} [params.description] - Permission description
     * @returns {Promise<Object>} - The updated permission information
     */
    update: async (id, params) =>
      await request(`/permissions/${id}`, params, { method: "PUT" }),

    /**
     * Delete a permission
     * @param {string} id - The ID of the permission
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/permissions/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Resource Tickets Endpoints
   * @namespace resourceTickets
   */
  const resourceTickets = {
    /**
     * Get all resource tickets
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The resource tickets information
     */
    getAll: async (params = {}) => await request("/resource-tickets", params),

    /**
     * Get a specific resource ticket by ID
     * @param {string} id - The ID of the resource ticket
     * @returns {Promise<Object>} - The resource ticket information
     */
    getById: async (id) => await request(`/resource-tickets/${id}`),

    /**
     * Create a new resource ticket
     * @param {Object} params - Resource ticket parameters
     * @param {string} params.name - Resource ticket name
     * @param {string} params.description - Resource ticket description
     * @returns {Promise<Object>} - The created resource ticket information
     */
    create: async (params) =>
      await request("/resource-tickets", params, { method: "POST" }),

    /**
     * Update an existing resource ticket
     * @param {string} id - The ID of the resource ticket
     * @param {Object} params - Resource ticket parameters
     * @param {string} [params.name] - Resource ticket name
     * @param {string} [params.description] - Resource ticket description
     * @returns {Promise<Object>} - The updated resource ticket information
     */
    update: async (id, params) =>
      await request(`/resource-tickets/${id}`, params, { method: "PUT" }),

    /**
     * Delete a resource ticket
     * @param {string} id - The ID of the resource ticket
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/resource-tickets/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Search Endpoints
   * @namespace search
   */
  const search = {
    /**
     * Search all items
     * @param {Object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The search results
     */
    searchAll: async (params) => await request("/search", params),
  };

  /**
   * Settings Endpoints
   * @namespace settings
   */
  const settings = {
    /**
     * Get all settings
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - The settings information
     */
    getAll: async (params = {}) => await request("/settings", params),

    /**
     * Update settings
     * @param {Object} params - Settings parameters
     * @returns {Promise<Object>} - The updated settings information
     */
    update: async (params) =>
      await request("/settings", params, { method: "PUT" }),
  };

  /**
   * Squirrel Endpoints
   * @namespace squirrel
   */
  const squirrel = {
    /**
     * Get all squirrel items
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The squirrel items information
     */
    getAll: async (params = {}) => await request("/squirrel", params),

    /**
     * Get a specific squirrel item by ID
     * @param {string} id - The ID of the squirrel item
     * @returns {Promise<Object>} - The squirrel item information
     */
    getById: async (id) => await request(`/squirrel/${id}`),

    /**
     * Create a new squirrel item
     * @param {Object} params - Squirrel item parameters
     * @param {string} params.name - Squirrel item name
     * @param {string} params.description - Squirrel item description
     * @returns {Promise<Object>} - The created squirrel item information
     */
    create: async (params) =>
      await request("/squirrel", params, { method: "POST" }),

    /**
     * Update an existing squirrel item
     * @param {string} id - The ID of the squirrel item
     * @param {Object} params - Squirrel item parameters
     * @param {string} [params.name] - Squirrel item name
     * @param {string} [params.description] - Squirrel item description
     * @returns {Promise<Object>} - The updated squirrel item information
     */
    update: async (id, params) =>
      await request(`/squirrel/${id}`, params, { method: "PUT" }),

    /**
     * Delete a squirrel item
     * @param {string} id - The ID of the squirrel item
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/squirrel/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Trash Endpoints
   * @namespace trash
   */
  const trash = {
    /**
     * Get all trash items
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The trash items information
     */
    getAll: async (params = {}) => await request("/trash", params),

    /**
     * Get a specific trash item by ID
     * @param {string} id - The ID of the trash item
     * @returns {Promise<Object>} - The trash item information
     */
    getById: async (id) => await request(`/trash/${id}`),

    /**
     * Restore a trash item
     * @param {string} id - The ID of the trash item
     * @returns {Promise<Object>} - The restore response
     */
    restore: async (id) =>
      await request(`/trash/${id}/restore`, {}, { method: "POST" }),

    /**
     * Delete a trash item
     * @param {string} id - The ID of the trash item
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/trash/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Two-Factor Endpoints
   * @namespace twoFactor
   */
  const twoFactor = {
    /**
     * Enable two-factor authentication
     * @param {Object} params - Two-factor parameters
     * @returns {Promise<Object>} - The enable response
     */
    enable: async (params) =>
      await request("/twofactor/enable", params, { method: "POST" }),

    /**
     * Disable two-factor authentication
     * @param {Object} params - Two-factor parameters
     * @returns {Promise<Object>} - The disable response
     */
    disable: async (params) =>
      await request("/twofactor/disable", params, { method: "POST" }),

    /**
     * Verify two-factor authentication
     * @param {Object} params - Two-factor parameters
     * @param {string} params.code - Verification code
     * @returns {Promise<Object>} - The verify response
     */
    verify: async (params) =>
      await request("/twofactor/verify", params, { method: "POST" }),
  };

  /**
   * User Endpoints
   * @namespace user
   */
  const user = {
    /**
     * Get all user information
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - The user information
     */
    getAll: async (params = {}) => await request("/user", params),

    /**
     * Get a specific user by ID
     * @param {string} id - The ID of the user
     * @returns {Promise<Object>} - The user information
     */
    getById: async (id) => await request(`/user/${id}`),

    /**
     * Create a new user
     * @param {Object} params - User parameters
     * @param {string} params.name - User name
     * @param {string} params.email - User email
     * @param {string} [params.password] - User password
     * @returns {Promise<Object>} - The created user information
     */
    create: async (params) =>
      await request("/user", params, { method: "POST" }),

    /**
     * Update an existing user
     * @param {string} id - The ID of the user
     * @param {Object} params - User parameters
     * @param {string} [params.name] - User name
     * @param {string} [params.email] - User email
     * @param {string} [params.password] - User password
     * @returns {Promise<Object>} - The updated user information
     */
    update: async (id, params) =>
      await request(`/user/${id}`, params, { method: "PUT" }),

    /**
     * Delete a user
     * @param {string} id - The ID of the user
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/user/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Users Endpoints
   * @namespace users
   */
  const users = {
    /**
     * Get all users
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The users information
     */
    getAll: async (params = {}) => await request("/users", params),

    /**
     * Get a specific user by ID
     * @param {string} id - The ID of the user
     * @returns {Promise<Object>} - The user information
     */
    getById: async (id) => await request(`/users/${id}`),

    /**
     * Create a new user
     * @param {Object} params - User parameters
     * @param {string} params.name - User name
     * @param {string} params.email - User email
     * @param {string} [params.password] - User password
     * @returns {Promise<Object>} - The created user information
     */
    create: async (params) =>
      await request("/users", params, { method: "POST" }),

    /**
     * Update an existing user
     * @param {string} id - The ID of the user
     * @param {Object} params - User parameters
     * @param {string} [params.name] - User name
     * @param {string} [params.email] - User email
     * @param {string} [params.password] - User password
     * @returns {Promise<Object>} - The updated user information
     */
    update: async (id, params) =>
      await request(`/users/${id}`, params, { method: "PUT" }),

    /**
     * Delete a user
     * @param {string} id - The ID of the user
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/users/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Version Endpoints
   * @namespace version
   */
  const version = {
    /**
     * Get all version information
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - The version information
     */
    getAll: async (params = {}) => await request("/version", params),
  };

  /**
   * Workspaces Endpoints
   * @namespace workspaces
   */
  const workspaces = {
    /**
     * Get all workspaces
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The workspaces information
     */
    getAll: async (params = {}) => await request("/workspaces", params),

    /**
     * Get a specific workspace by ID
     * @param {string} id - The ID of the workspace
     * @returns {Promise<Object>} - The workspace information
     */
    getById: async (id) => await request(`/workspaces/${id}`),

    /**
     * Create a new workspace
     * @param {Object} params - Workspace parameters
     * @param {string} params.name - Workspace name
     * @param {string} params.description - Workspace description
     * @returns {Promise<Object>} - The created workspace information
     */
    create: async (params) =>
      await request("/workspaces", params, { method: "POST" }),

    /**
     * Update an existing workspace
     * @param {string} id - The ID of the workspace
     * @param {Object} params - Workspace parameters
     * @param {string} [params.name] - Workspace name
     * @param {string} [params.description] - Workspace description
     * @returns {Promise<Object>} - The updated workspace information
     */
    update: async (id, params) =>
      await request(`/workspaces/${id}`, params, { method: "PUT" }),

    /**
     * Delete a workspace
     * @param {string} id - The ID of the workspace
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/workspaces/${id}`, {}, { method: "DELETE" }),
  };

  return {
    info,
    authenticate,
    collections,
    contacts,
    embedTokens,
    faces,
    galleries,
    integrations,
    library,
    media,
    mediaVersions,
    mlMetadata,
    metadata,
    oauth,
    organization,
    people,
    portal,
    permissions,
    resourceTickets,
    search,
    settings,
    squirrel,
    trash,
    twoFactor,
    user,
    users,
    version,
    workspaces,
  };
}

/**
 * Create a PhotoShelter API client
 * @param {string} apiKey - Your PhotoShelter API key

 */
export function PhotoShelterV3API(apiKey) {
  const baseUrl = "https://www.photoshelter.com/psapi/v3";
  let authToken = null,
    org = null,
    isTwoFactor = null;

  const handleErrors = async (response, location) => {
    if (response.status == "404") {
      throw new Error(
        `Request Failed. Request Response: ${location} = ${response.statusText}`
      );
    }
    const json = await response.json();
    const msg = json.errors
      .map((e) => e.title)
      .filter(Boolean)
      .join(" | ");
    throw new Error(`Request Failed. Request Response: ${location} = ${msg}`);
  };

  const responseType = async (response) => {
    const clone = response.clone();
    try {
      const json = await response.json();
      return json.data;
    } catch (error) {
      return await clone.arrayBuffer();
    }
  };

  /**
   * Make an authenticated request to the PhotoShelter API
   * @param {string} endpoint - The API endpoint
   * @param {Object} params - The query parameters
   * @param {Object} [options] - Optional fetch options (e.g., method, headers)
   * @returns {Promise<Object>} - The API response
   */
  const request = async (endpoint, params = {}, options = {}) => {
    if (!authToken) {
      throw new Error("No auth token. Make sure to authenticate.login() first");
    }
    options.headers = {
      ...options.headers,
      "X-PS-Auth-Token": authToken,
      "X-PS-API-Key": apiKey,
      "Content-Type": "application/json",
    };

    const url = new URL(`${baseUrl}${endpoint}`);
    const searchParams = new URLSearchParams(params);

    url.search = searchParams.toString();

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        return await handleErrors(response, endpoint);
      }

      return await responseType(response);
    } catch (error) {
      throw error;
    }
  };

  const toForm = (obj) => {
    return Object.keys(obj)
      .map((key) =>
        obj[key]
          ? `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
          : ""
      )
      .filter(Boolean)
      .join("&");
  };

  // Authentication Endpoints
  const authenticate = {
    /**
     * Authenticate user and get a token
     * @param {string} email - Email
     * @param {string} password - Password
     * @param {string} [orgId] - [Optional] Your organization ID
     * @returns {Promise}
     * @throws Throws an error if not ok status
     */
    login: async (email, password, orgId) => {
      try {
        const body = toForm({ email, password, mode: "token", org_id: orgId });
        const response = await fetch(`${baseUrl}/mem/authenticate`, {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "X-PS-Api-Key": apiKey,
          },
          body,
        });

        if (!response.ok) {
          return await handleErrors(response, "login");
        }
        const json = await responseType(response);
        authToken = json.token;
        org = json.org;
        isTwoFactor = json.two_factor;
      } catch (error) {
        throw error;
      }
    },
  };

  /**
   * Workspaces Endpoints
   * @namespace workspaces
   */
  const workspaces = {
    /**
     * Get current review information for a media asset
     * @param {string} workspaceId - The ID of the workspace
     * @param {string} mediaId - The ID of the media
     * @returns {Promise<Object>} - The media review object
     */
    getMediaReview: async (workspaceId, mediaId) =>
      await request(`/workspace/${workspaceId}/media/${mediaId}/review`),
  };

  return { authenticate, workspaces };
}
