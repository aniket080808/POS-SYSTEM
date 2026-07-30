import pandas as pd

df = pd.read_excel('product_import_realistic_india.xlsx')
print('Shape:', df.shape)
print('Columns:', list(df.columns))
print('StoreId unique:', df['StoreId'].unique())
print('Price check:', (df['Selling Price'] <= df['MRP']).all())
print('SKU dups:', df['SKU'].duplicated().sum())
print('ProductName dups:', df['Product Name'].duplicated().sum())
print('Category counts:')
print(df.groupby('CategoryId').size())