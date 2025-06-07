"use client";

import type React from "react";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface SearchBarPresentationProps {
	searchTerm: string;
	onSearch: (term: string) => void;
}

export function SearchBarPresentation({
	searchTerm,
	onSearch,
}: SearchBarPresentationProps) {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch(searchTerm);
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
				<Input
					type="text"
					placeholder="商品を検索..."
					value={searchTerm}
					onChange={(e) => onSearch(e.target.value)}
					className="pl-10"
				/>
			</div>
			<Button type="submit">検索</Button>
		</form>
	);
}
