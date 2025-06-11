import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryFilterContainer } from "./categoryFilterContainer";
import "@testing-library/jest-dom/vitest";
import { label } from "happy-dom/lib/PropertySymbol.js";

// Mock CategoryFilterPresentation
vi.mock("./categoryFilterPresentational", () => ({
	CategoryFilterPresentation: ({
		categories,
		selectedCategories,
		onCategoryChange,
	}: any) => (
		<div data-testid="category-filter-presentation">
			{categories.map((category: any) => (
				<div key={category.id}>
					<input
						type="checkbox"
						id={category.id}
						checked={selectedCategories.includes(category.id)}
						onChange={(e) => onCategoryChange(category.id, e.target.checked)}
						data-testid={`checkbox-${category.id}`}
					/>
					<label htmlFor={category.id}>{category.name}</label>
				</div>
			))}
		</div>
	),
}));

// console.logをモック
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("[Container test] CategoryFilter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		consoleSpy.mockRestore();
	});

	it("CategoryFilterPresentationが正しいpropsで呼び出される", () => {
		render(<CategoryFilterContainer />);

		expect(
			screen.getByTestId("category-filter-presentation"),
		).toBeInTheDocument();

		// カテゴリが表示されることを確認
		expect(screen.getByText("家電・スマホ・カメラ")).toBeInTheDocument();
		expect(screen.getByText("ファッション")).toBeInTheDocument();
		expect(screen.getByText("本・音楽・ゲーム")).toBeInTheDocument();
		expect(screen.getByText("スポーツ・レジャー")).toBeInTheDocument();
		expect(screen.getByText("インテリア・住まい")).toBeInTheDocument();
		expect(screen.getByText("コスメ・香水・美容")).toBeInTheDocument();
	});

	it("初期状態では何も選択されていない", () => {
		render(<CategoryFilterContainer />);

		const checkboxes = screen.getAllByRole("checkbox");
		checkboxes.forEach((checkbox) => {
			expect(checkbox).not.toBeChecked();
		});
	});

	it("カテゴリを選択すると状態が更新される", async () => {
		const user = userEvent.setup();

		render(<CategoryFilterContainer />);

		const electronicsCheckbox = screen.getByTestId("checkbox-electrics");
		await user.click(electronicsCheckbox);

		expect(electronicsCheckbox).toBeChecked();
	});

	it("複数のカテゴリを選択できる", async () => {
		const user = userEvent.setup();

		render(<CategoryFilterContainer />);

		const electronicsCheckbox = screen.getByTestId("checkbox-electrics");
		const fashionCheckbox = screen.getByTestId("checkbox-fashion");

		await user.click(electronicsCheckbox);
		await user.click(fashionCheckbox);

		expect(electronicsCheckbox).toBeChecked();
		expect(fashionCheckbox).toBeChecked();
	});

	it("選択済みのカテゴリを再度クリックすると選択が解除される", async () => {
		const user = userEvent.setup();

		render(<CategoryFilterContainer />);

		const electronicsCheckbox = screen.getByTestId("checkbox-electrics");

		// 最初にチェック
		await user.click(electronicsCheckbox);
		expect(electronicsCheckbox).toBeChecked();

		// 再度クリックして解除
		await user.click(electronicsCheckbox);
		expect(electronicsCheckbox).not.toBeChecked();
	});

	it("カテゴリの変更時にconsole.logが呼ばれる", async () => {
		const user = userEvent.setup();

		render(<CategoryFilterContainer />);

		const electronicsCheckbox = screen.getByTestId("checkbox-electrics");
		await user.click(electronicsCheckbox);

		expect(consoleSpy).toHaveBeenCalledWith("選択されたカテゴリー：", [
			"electrics",
		]);
	});

	it("複数のカテゴリを選択した時の状態管理が正しく動作する", async () => {
		const user = userEvent.setup();

		render(<CategoryFilterContainer />);

		// 順番にカテゴリを選択
		await user.click(screen.getByTestId("checkbox-electrics"));
		await user.click(screen.getByTestId("checkbox-fashion"));
		await user.click(screen.getByTestId("checkbox-books"));

		// 3つのカテゴリが選択されていることを確認
		expect(screen.getByTestId("checkbox-electrics")).toBeChecked();
		expect(screen.getByTestId("checkbox-fashion")).toBeChecked();
		expect(screen.getByTestId("checkbox-books")).toBeChecked();

		// 中間のカテゴリを解除
		await user.click(screen.getByTestId("checkbox-fashion"));

		// 残りの2つが選択されていることを確認
		expect(screen.getByTestId("checkbox-electrics")).toBeChecked();
		//expect(screen.getByTestId("checkbox-fashion")).not.toBeChecked();
		expect(screen.getByTestId("checkbox-books")).toBeChecked();
	});
});
