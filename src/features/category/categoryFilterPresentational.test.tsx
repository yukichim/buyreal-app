import { render, screen } from "@testing-library/react";
import { CategoryFilterPresentation } from "./categoryFilterPresentational";

describe("[Presentational test] CategoryFilter", () => {
	it("カテゴリ選択が0件の場合、", async () => {
		render(
			<CategoryFilterPresentation
				categories={[]}
				onCategoryChange={() => {}}
				selectedCategories={[]}
			/>,
		);
	});
});
