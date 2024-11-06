import efinance as ef
import json
import sys

def fetch_stock_price(stock_codes):
    # 获取最新报价
    quotes = ef.stock.get_latest_quote(stock_codes)
    # print(quotes)

    # 解析最新价
    latest_prices = quotes.set_index('代码')['最新价'].to_dict()
    # 解析涨跌幅
    price_changes = quotes.set_index('代码')['涨跌幅'].to_dict()

    # 将最新价和涨跌幅拼成一个字符串
    latest_prices = {code: f"{price}[{price_changes[code]}%]" for code, price in latest_prices.items()}
    # print(latest_prices)

    # 生成一个对象， 其中键是股票代码，值是最新价
    ret = json.dumps(latest_prices, ensure_ascii=False, indent=2)

    return ret

if __name__ == "__main__":
    stock_codes = sys.argv[1:]
    if not stock_codes:
        print(json.dumps({"error": "No stock codes provided"}))
        sys.exit(1)
    
    try:
        data = fetch_stock_price(stock_codes)
        print(json.dumps(data))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)