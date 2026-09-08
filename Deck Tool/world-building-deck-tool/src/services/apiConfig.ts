const API_URL = "http://127.0.0.1:8000/api/v1.0"


function request(endpoint: string, options: RequestInit = {}, errorMessage: string = "An error occurred"): Promise<Response> {
    const url = `${API_URL}${endpoint}`;
    return fetch(url, options).then(response => {
        if (!response.ok) {
            throw new Error(`${errorMessage}: ${response.status}`);
        }
        return response;
    }).catch(error => {
        console.error(error.message);
        throw error;
    })
}

export { request };