require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

const rootUrl = 'https://api.pokemontcg.io';
const headers = { 'Content-Type': 'application/json' };

const apiCall = {
    get: async (url) => {
        const response = await fetch(`${rootUrl}${url}`, {
            method: 'get',
            headers: headers,
        });

        try {
            const json = await response.json();
            return json;
        } catch(error) {
            console.error(`Error converting response to json in apiCall.get() for ${rootUrl}${url}`);
            throw error;
        }
    },
    post: async (url, body = {}) => {
        const response = await fetch(`${rootUrl}${url}`, {
            method: 'post',
            body: JSON.stringify(body),
            headers: headers,
        });

        try {
            const json = await response.json();
            return json;
        } catch(error) {
            console.error(`Error converting response to json in apiCall.post() for ${rootUrl}${url}`);
            throw error;
        }
    },
};

export const getPokemonCards = async () => {
    const url = '/v1/cards';
    return await apiCall.get(url);
}

export const getPokemonCardDetails = async (cardId) => {
    const url = `/v1/cards/${cardId}`;
    return await apiCall.get(url);
}
