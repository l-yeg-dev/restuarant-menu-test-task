import axios from "axios";

const API_BASE_URL = 'http://localhost:3000/';

const api = axios.create({
	baseURL: API_BASE_URL,
});

export async function getMenu() {
	return await api.get('/data.json').then(response => {

		return response.data;
	}).catch(error => {
		console.log('App error', error)
	});
}
