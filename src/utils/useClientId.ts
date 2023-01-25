import { v4 as uuidv4 } from 'uuid'

export function useClientId() {
    if (localStorage.getItem('id') == undefined)
        localStorage.setItem('id', uuidv4())

    return localStorage.getItem('id') as string
}
