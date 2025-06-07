export interface UserId {
	value: string;
}

export interface User {
	id: UserId;
	username: string;
	email: string;
	displayName: string;
	avatar?: string;
	rating: number;
	createdAt: Date;
	updatedAt: Date;
}

export class UserEntity {
	constructor(private user: User) {}

	getId(): UserId {
		return this.user.id;
	}

	getUsername(): string {
		return this.user.username;
	}

	getDisplayName(): string {
		return this.user.displayName;
	}

	getRating(): number {
		return this.user.rating;
	}

	updateProfile(displayName: string, avatar?: string): void {
		this.user.displayName = displayName;
		if (avatar) {
			this.user.avatar = avatar;
		}
		this.user.updatedAt = new Date();
	}

	toPlainObject(): User {
		return { ...this.user };
	}
}
