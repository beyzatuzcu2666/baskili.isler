import http from './http';
import { User } from '../types/user';

export const usersService = {
  async getUsers(): Promise<User[]> {
    try {
      const response = await http.get('/users');
      return response || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const response = await http.post('/users', userData);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(userId: number, userData: Partial<Omit<User, 'id'>>): Promise<User> {
    try {
      const response = await http.patch(`/users/${userId}`, userData);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(userId: number): Promise<void> {
    try {
      await http.delete(`/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async getUserById(userId: number): Promise<User> {
    try {
      const response = await http.get(`/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}; 