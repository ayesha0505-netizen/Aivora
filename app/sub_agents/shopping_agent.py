"""Shopping Sub-Agent running in ADK task mode."""

from pydantic import BaseModel, Field


class ShoppingInput(BaseModel):
    """Input schema for Shopping sub-agent."""

    destination: str
    items_needed: list[str] = Field(description="List of items the user needs to purchase for the trip")


class Product(BaseModel):
    """Recommended product details."""

    name: str = Field(description="Product name")
    estimated_price: float = Field(ge=0, description="Estimated price of the product")
    currency: str = Field(default="USD")
    purchase_url: str = Field(description="URL to purchase the item")


class ShoppingOutput(BaseModel):
    """Output schema for Shopping sub-agent."""

    recommended_products: list[Product] = Field(default_factory=list)
    total_estimated_shopping_cost: float = Field(ge=0)


def run_shopping_agent(input_data: ShoppingInput) -> ShoppingOutput:
    """Execute shopping search (mocked for local dev)."""
    
    # Mocking products based on items needed
    products = []
    total_cost = 0.0
    
    for item in input_data.items_needed:
        # Generate some mock price and product data
        price = 25.0 if "adapter" in item.lower() else 50.0
        products.append(
            Product(
                name=f"Premium {item.title()}",
                estimated_price=price,
                purchase_url=f"https://amazon.com/search?q={item.replace(' ', '+')}"
            )
        )
        total_cost += price

    return ShoppingOutput(
        recommended_products=products,
        total_estimated_shopping_cost=total_cost,
    )
