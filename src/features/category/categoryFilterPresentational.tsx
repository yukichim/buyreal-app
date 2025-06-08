import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";

interface Category {
	id: string;
	name: string;
}

interface CategoryFilterPresentationProps {
	categories: Category[];
	selectedCategories: string[];
	onCategoryChange: (categoryId: string, checked: boolean) => void;
}

/**
 * カテゴリフィルタ用表示コンポーネント
 * @param param0
 * @returns
 */
export function CategoryFilterPresentation({
	categories,
	selectedCategories,
	onCategoryChange,
}: CategoryFilterPresentationProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">カテゴリー</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{categories.map((category) => (
					<div key={category.id} className="flex items-center space-x-2">
						<Checkbox
							id={category.id}
							checked={selectedCategories.includes(category.id)}
							onCheckedChange={(checked) =>
								onCategoryChange(category.id, !!checked)
							}
						/>
						<label
							htmlFor={category.id}
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
						>
							{category.name}
						</label>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
