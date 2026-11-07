import os
import pandas as pd
import numpy as np

def parse_arff(filepath: str) -> pd.DataFrame:
    """
    Robust ARFF parser that handles comments, attributes with quotes,
    whitespace in nominal values, missing values ('?'), and returns a clean DataFrame.
    """
    attributes = []
    data_lines = []
    is_data = False
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            stripped = line.strip()
            if not stripped or stripped.startswith('%'):
                continue
            if not is_data:
                if stripped.lower().startswith('@attribute'):
                    # format: @attribute <name> <type/nominal-spec>
                    parts = stripped.split(None, 2)
                    if len(parts) >= 2:
                        raw_name = parts[1].strip()
                        raw_name = raw_name.strip("'\"")
                        attributes.append(raw_name)
                elif stripped.lower().startswith('@data'):
                    is_data = True
            else:
                tokens = [t.strip().strip("'\"") for t in stripped.split(',')]
                if len(tokens) == len(attributes):
                    data_lines.append(tokens)
                elif len(tokens) > 0 and len(tokens) != len(attributes):
                    # Handle possible trailing commas or spacing
                    tokens = [t.strip().strip("'\"") for t in stripped.split(',') if t != '']
                    if len(tokens) == len(attributes):
                        data_lines.append(tokens)

    df = pd.DataFrame(data_lines, columns=attributes)
    # Replace '?' with None/np.nan
    df = df.replace('?', np.nan)
    return df

if __name__ == '__main__':
    data_dir = os.path.dirname(os.path.abspath(__file__))
    # if in utils, data is in ../data
    if not os.path.exists(os.path.join(data_dir, 'mushroom.arff')):
        data_dir = os.path.abspath(os.path.join(data_dir, '..', 'data'))
    
    for fname in ['mushroom', 'soybean']:
        arff_path = os.path.join(data_dir, f'{fname}.arff')
        if os.path.exists(arff_path):
            df = parse_arff(arff_path)
            csv_path = os.path.join(data_dir, f'{fname}.csv')
            df.to_csv(csv_path, index=False)
            print(f'Successfully parsed {fname}: Shape {df.shape}, saved to {csv_path}')
            if 'class' in df.columns:
                print(f'Classes in {fname}: {df["class"].nunique()} unique classes')
