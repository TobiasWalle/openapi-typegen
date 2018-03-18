export interface Order {
    id?: number;
    petId?: number;
    quantity?: number;
    shipDate?: string;
    status?: string;
    complete?: boolean;
}

export interface Category {
    id?: number;
    name?: string;
}

export interface User {
    id?: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phone?: string;
    userStatus?: number;
}

export interface Tag {
    id?: number;
    name?: string;
}

export interface Pet {
    id?: number;
    category?: Category;
    name: string;
    photoUrls: string;
    tags?: string;
    status?: string;
}

export interface ApiResponse {
    code?: number;
    type?: string;
    message?: string;
}
