import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PollOption {
    id: string;
    text: string;
    imageUrl?: string;
    voteCount: number;
    percentage?: number;
}

export interface Poll {
    id: string;
    title: string;
    description?: string;
    creatorName: string;
    creatorId?: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
    totalVotes: number;
    hasVotedToday?: boolean;
    canEdit?: boolean;
    options: PollOption[];
}

export interface CreatePollOption {
    text: string;
    hasImage?: boolean;
}

export interface CreatePollRequest {
    title: string;
    description?: string;
    endDate?: string;
    options: CreatePollOption[];
}

export interface PaginatedResponse<T> {
    data?: T[];
    polls?: T[];
    votes?: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface VoteRequest {
    pollId: string;
    optionId: string;
}

export interface VoteHistory {
    id: string;
    votedAt: string;
    poll: {
        id: string;
        title: string;
    };
    option: {
        id: string;
        text: string;
        imageUrl?: string;
    };
}

export interface PollStats {
    pollTitle: string;
    totalStats: {
        uniqueVoters: number;
        totalVotes: number;
        firstVote: string;
        lastVote: string;
    };
    dailyStats: Array<{
        date: string;
        voteCount: number;
    }>;
    optionStats: Array<{
        id: string;
        text: string;
        imageUrl?: string;
        voteCount: number;
        percentage: number;
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class PollService {
    private readonly API_URL = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Poll CRUD operations
    createPoll(pollData: CreatePollRequest, images?: File[]): Observable<any> {
        const formData = new FormData();
        formData.append('pollData', JSON.stringify(pollData));

        if (images && images.length > 0) {
            images.forEach((image, index) => {
                formData.append('images', image);
            });
        }

        return this.http.post(`${this.API_URL}/polls`, formData);
    }

    getPolls(params?: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
        active?: boolean;
    }): Observable<PaginatedResponse<Poll>> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                const value = (params as any)[key];
                if (value !== undefined && value !== null) {
                    httpParams = httpParams.set(key, value.toString());
                }
            });
        }

        return this.http.get<PaginatedResponse<Poll>>(`${this.API_URL}/polls`, { params: httpParams });
    }

    getPoll(id: string): Observable<{ poll: Poll }> {
        return this.http.get<{ poll: Poll }>(`${this.API_URL}/polls/${id}`);
    }

    getMyPolls(params?: { page?: number; limit?: number }): Observable<PaginatedResponse<Poll>> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                const value = (params as any)[key];
                if (value !== undefined && value !== null) {
                    httpParams = httpParams.set(key, value.toString());
                }
            });
        }

        return this.http.get<PaginatedResponse<Poll>>(`${this.API_URL}/polls/my/polls`, { params: httpParams });
    }

    updatePoll(id: string, pollData: Partial<Poll>): Observable<any> {
        return this.http.put(`${this.API_URL}/polls/${id}`, pollData);
    }

    deletePoll(id: string): Observable<any> {
        return this.http.delete(`${this.API_URL}/polls/${id}`);
    }

    // Voting operations
    vote(voteData: VoteRequest): Observable<any> {
        return this.http.post(`${this.API_URL}/votes`, voteData);
    }

    canVote(pollId: string): Observable<{ canVote: boolean; reason?: string }> {
        return this.http.get<{ canVote: boolean; reason?: string }>(`${this.API_URL}/votes/can-vote/${pollId}`);
    }

    getVoteHistory(params?: { page?: number; limit?: number }): Observable<PaginatedResponse<VoteHistory>> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                const value = (params as any)[key];
                if (value !== undefined && value !== null) {
                    httpParams = httpParams.set(key, value.toString());
                }
            });
        }

        return this.http.get<PaginatedResponse<VoteHistory>>(`${this.API_URL}/votes/history`, { params: httpParams });
    }

    // Statistics (for poll creators)
    getPollStats(pollId: string): Observable<PollStats> {
        return this.http.get<PollStats>(`${this.API_URL}/votes/stats/${pollId}`);
    }

    getPollVotes(pollId: string, params?: { page?: number; limit?: number }): Observable<PaginatedResponse<any>> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                const value = (params as any)[key];
                if (value !== undefined && value !== null) {
                    httpParams = httpParams.set(key, value.toString());
                }
            });
        }

        return this.http.get<PaginatedResponse<any>>(`${this.API_URL}/votes/poll/${pollId}`, { params: httpParams });
    }
}