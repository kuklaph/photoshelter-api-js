/**
 * Create a PhotoShelter API client
 * @param {string} apiKey - Your PhotoShelter API key

 */
export function PhotoShelterV4API(apiKey) {
  const baseUrl = "https://www.photoshelter.com/psapi/v4.0";
  let authToken = null;

  const handleErrors = (json) => {
    const msg = json.errors.reduce((n, t, i) => {
      t += n.title + i == json.errors.length - 1 ? "" : " | ";
    }, "");

    throw new Error(`Request Failed. Request Response: ${msg}`);
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
      const json = await response.json();
      if (!response.ok) {
        handleErrors(json);
      }
      return json;
    } catch (error) {
      throw error;
    }
  };

  const toForm = (obj) => {
    return Object.keys(obj)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
      )
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

        const json = await response.json();
        if (!response.ok) {
          handleErrors(json);
        }
        authToken = json.token;
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
  };

  /**
   * Contacts Endpoints
   * @namespace contacts
   */
  const contacts = {
    /**
     * Get all contacts
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The contacts information
     */
    getAll: async (params = {}) => await request("/contacts", params),

    /**
     * Get a specific contact by ID
     * @param {string} id - The ID of the contact
     * @returns {Promise<Object>} - The contact information
     */
    getById: async (id) => await request(`/contacts/${id}`),

    /**
     * Create a new contact
     * @param {Object} params - Contact parameters
     * @param {string} params.name - Contact name
     * @param {string} params.email - Contact email
     * @param {string} [params.phone] - Contact phone
     * @returns {Promise<Object>} - The created contact information
     */
    create: async (params) =>
      await request("/contacts", params, { method: "POST" }),

    /**
     * Update an existing contact
     * @param {string} id - The ID of the contact
     * @param {Object} params - Contact parameters
     * @param {string} [params.name] - Contact name
     * @param {string} [params.email] - Contact email
     * @param {string} [params.phone] - Contact phone
     * @returns {Promise<Object>} - The updated contact information
     */
    update: async (id, params) =>
      await request(`/contacts/${id}`, params, { method: "PUT" }),

    /**
     * Delete a contact
     * @param {string} id - The ID of the contact
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/contacts/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * EmbedTokens Endpoints
   * @namespace embedTokens
   */
  const embedTokens = {
    /**
     * Get all embed tokens
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The embed tokens information
     */
    getAll: async (params = {}) => await request("/embedtokens", params),

    /**
     * Get a specific embed token by ID
     * @param {string} id - The ID of the embed token
     * @returns {Promise<Object>} - The embed token information
     */
    getById: async (id) => await request(`/embedtokens/${id}`),

    /**
     * Create a new embed token
     * @param {Object} params - Embed token parameters
     * @param {string} params.name - Embed token name
     * @param {string} params.description - Embed token description
     * @returns {Promise<Object>} - The created embed token information
     */
    create: async (params) =>
      await request("/embedtokens", params, { method: "POST" }),

    /**
     * Delete an embed token
     * @param {string} id - The ID of the embed token
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/embedtokens/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Faces Endpoints
   * @namespace faces
   */
  const faces = {
    /**
     * Get all faces
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The faces information
     */
    getAll: async (params = {}) => await request("/faces", params),

    /**
     * Get a specific face by ID
     * @param {string} id - The ID of the face
     * @returns {Promise<Object>} - The face information
     */
    getById: async (id) => await request(`/faces/${id}`),

    /**
     * Create a new face
     * @param {Object} params - Face parameters
     * @param {string} params.name - Face name
     * @param {string} [params.description] - Face description
     * @returns {Promise<Object>} - The created face information
     */
    create: async (params) =>
      await request("/faces", params, { method: "POST" }),

    /**
     * Update an existing face
     * @param {string} id - The ID of the face
     * @param {Object} params - Face parameters
     * @param {string} [params.name] - Face name
     * @param {string} [params.description] - Face description
     * @returns {Promise<Object>} - The updated face information
     */
    update: async (id, params) =>
      await request(`/faces/${id}`, params, { method: "PUT" }),

    /**
     * Delete a face
     * @param {string} id - The ID of the face
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
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
     * Search galleries
     * @param {Object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The search results
     */
    search: async (params) => await request("/galleries/search", params),
  };

  /**
   * Integrations Endpoints
   * @namespace integrations
   */
  const integrations = {
    /**
     * Get all integrations
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The integrations information
     */
    getAll: async (params = {}) => await request("/integrations", params),

    /**
     * Get a specific integration by ID
     * @param {string} id - The ID of the integration
     * @returns {Promise<Object>} - The integration information
     */
    getById: async (id) => await request(`/integrations/${id}`),

    /**
     * Create a new integration
     * @param {Object} params - Integration parameters
     * @param {string} params.name - Integration name
     * @param {string} params.description - Integration description
     * @returns {Promise<Object>} - The created integration information
     */
    create: async (params) =>
      await request("/integrations", params, { method: "POST" }),

    /**
     * Update an existing integration
     * @param {string} id - The ID of the integration
     * @param {Object} params - Integration parameters
     * @param {string} [params.name] - Integration name
     * @param {string} [params.description] - Integration description
     * @returns {Promise<Object>} - The updated integration information
     */
    update: async (id, params) =>
      await request(`/integrations/${id}`, params, { method: "PUT" }),

    /**
     * Delete an integration
     * @param {string} id - The ID of the integration
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/integrations/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Library Endpoints
   * @namespace library
   */
  const library = {
    /**
     * Get all library items
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The library items information
     */
    getAll: async (params = {}) => await request("/library", params),

    /**
     * Get a specific library item by ID
     * @param {string} id - The ID of the library item
     * @returns {Promise<Object>} - The library item information
     */
    getById: async (id) => await request(`/library/${id}`),

    /**
     * Search library items
     * @param {Object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The search results
     */
    search: async (params) => await request("/library/search", params),
  };

  /**
   * Media Endpoints
   * @namespace media
   */
  const media = {
    /**
     * Get all media items
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The media items information
     */
    getAll: async (params = {}) => await request("/media", params),

    /**
     * Get a specific media item by ID
     * @param {string} id - The ID of the media item
     * @returns {Promise<Object>} - The media item information
     */
    getById: async (id) => await request(`/media/${id}`),

    /**
     * Create a new media item
     * @param {Object} params - Media item parameters
     * @param {string} params.name - Media item name
     * @param {string} params.description - Media item description
     * @returns {Promise<Object>} - The created media item information
     */
    create: async (params) =>
      await request("/media", params, { method: "POST" }),

    /**
     * Update an existing media item
     * @param {string} id - The ID of the media item
     * @param {Object} params - Media item parameters
     * @param {string} [params.name] - Media item name
     * @param {string} [params.description] - Media item description
     * @returns {Promise<Object>} - The updated media item information
     */
    update: async (id, params) =>
      await request(`/media/${id}`, params, { method: "PUT" }),

    /**
     * Delete a media item
     * @param {string} id - The ID of the media item
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/media/${id}`, {}, { method: "DELETE" }),
  };

  /**
   * Media Versions Endpoints
   * @namespace mediaVersions
   */
  const mediaVersions = {
    /**
     * Get all media versions
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The media versions information
     */
    getAll: async (params = {}) => await request("/media-versions", params),

    /**
     * Get a specific media version by ID
     * @param {string} id - The ID of the media version
     * @returns {Promise<Object>} - The media version information
     */
    getById: async (id) => await request(`/media-versions/${id}`),

    /**
     * Create a new media version
     * @param {Object} params - Media version parameters
     * @param {string} params.name - Media version name
     * @param {string} params.description - Media version description
     * @returns {Promise<Object>} - The created media version information
     */
    create: async (params) =>
      await request("/media-versions", params, { method: "POST" }),

    /**
     * Update an existing media version
     * @param {string} id - The ID of the media version
     * @param {Object} params - Media version parameters
     * @param {string} [params.name] - Media version name
     * @param {string} [params.description] - Media version description
     * @returns {Promise<Object>} - The updated media version information
     */
    update: async (id, params) =>
      await request(`/media-versions/${id}`, params, { method: "PUT" }),

    /**
     * Delete a media version
     * @param {string} id - The ID of the media version
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/media-versions/${id}`, {}, { method: "DELETE" }),
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
     * Get all metadata
     * @param {Object} params - Query parameters
     * @param {number} [params.page] - Page number
     * @param {number} [params.per_page] - Number of items per page
     * @returns {Promise<Object>} - The metadata information
     */
    getAll: async (params = {}) => await request("/metadata", params),

    /**
     * Get a specific metadata by ID
     * @param {string} id - The ID of the metadata
     * @returns {Promise<Object>} - The metadata information
     */
    getById: async (id) => await request(`/metadata/${id}`),

    /**
     * Create a new metadata
     * @param {Object} params - Metadata parameters
     * @param {string} params.name - Metadata name
     * @param {string} params.description - Metadata description
     * @returns {Promise<Object>} - The created metadata information
     */
    create: async (params) =>
      await request("/metadata", params, { method: "POST" }),

    /**
     * Update an existing metadata
     * @param {string} id - The ID of the metadata
     * @param {Object} params - Metadata parameters
     * @param {string} [params.name] - Metadata name
     * @param {string} [params.description] - Metadata description
     * @returns {Promise<Object>} - The updated metadata information
     */
    update: async (id, params) =>
      await request(`/metadata/${id}`, params, { method: "PUT" }),

    /**
     * Delete a metadata
     * @param {string} id - The ID of the metadata
     * @returns {Promise<Object>} - The delete response
     */
    delete: async (id) =>
      await request(`/metadata/${id}`, {}, { method: "DELETE" }),
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
    authToken,
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
