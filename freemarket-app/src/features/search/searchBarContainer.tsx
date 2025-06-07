"use client";

import { useState } from "react";
import { SearchBarPresentation } from "./searchBarPresentation";

export function SearchBarContainer() {
	const [searchTerm, setSearchTerm] = useState("");

	const handleSearch = (term: string) => {
		setSearchTerm(term);
		// 実際のアプリでは検索結果を更新する処理を実装
		console.log("検索:", term);
	};

	return (
		<SearchBarPresentation searchTerm={searchTerm} onSearch={handleSearch} />
	);
}
