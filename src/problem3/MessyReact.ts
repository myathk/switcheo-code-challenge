import { useEffect, useState, useMemo } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
  formatted: string;
  usdValue: number;
}

// define interface for response from the url. All interfaces to be put in interface folder
interface CurrencyPrice {
  currency: string;
  date: string;
  price: number;
}

// to be put in a class file
class Datasource {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getPrices(): Promise<CurrencyPrice[]> {
    const res = await fetch(this.url);

    if (!res.ok) {
      throw new Error(`getPrices Error: ${res.status}`);
    }

    const data = await res.json();
    const currencyPrices = data.map((obj: any) => ({
      currency: obj.currency,
      date: obj.date,
      price: obj.price,
    }));

    return currencyPrices;
  }
}

// to be put in a constant or configuration file
enum BlockchainPriority {
  Osmosis = 100,
  Ethereum = 50,
  Arbitrum = 30,
  Zilliqa = 20,
  Neo = 20,
  Default = -99,
}

// move getPriority to outside here to avoid being redefined on every render
const getPriority = (blockchain: any): number => {
  switch (blockchain) {
    case "Osmosis":
      return BlockchainPriority.Osmosis;
    case "Ethereum":
      return BlockchainPriority.Ethereum;
    case "Arbitrum":
      return BlockchainPriority.Arbitrum;
    case "Zilliqa":
      return BlockchainPriority.Zilliqa;
    case "Neo":
      return BlockchainPriority.Neo;
    default:
      return BlockchainPriority.Default;
  }
};

// move out useEffect and create custom hook for prices. to be put in a usePrices file under custom hooks folder
const usePrices = (datasource) => {
  const [prices, setPrices] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    datasource
      .getPrices()
      .then((currencyPrices: CurrencyPrice[]) => {
        const currencyToPrice = currencyPrices.reduce((acc, currencyPrice) => {
          acc[currencyPrice.currency] = currencyPrice.price;
          return acc;
        }, {});

        setPrices(currencyToPrice);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  return prices;
};

// move datasource outside here to avoid being redefined on every render
const datasource = new Datasource("https://interview.switcheo.com/prices.json");

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances: WalletBalance[] = useWalletBalances();
  const prices: { [key: string]: number } = usePrices(datasource);

  // make it such that getPriority is ran only once for each element in one iteration
  const sortedAndFormattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return balances
      .map((balance) => ({
        ...balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter(
        ({ amount, priority }) =>
          priority !== BlockchainPriority.Default && amount > 0
      )
      .sort((lhs, rhs) => rhs.priority - lhs.priority)
      .map(({ priority, ...balance }) => ({
        ...balance,
        formatted: balance.amount.toFixed(),
        usdValue: prices[balance.currency] * balance.amount
      }));
  }, [balances, prices]);

  const rows = sortedAndFormattedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      return (
        <WalletRow
          className={classes.row}
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};
