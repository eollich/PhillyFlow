import torch
import torch.nn as nn
import torch.optim as optim

# Define a simple neural network
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.fc = nn.Linear(10, 1)

    def forward(self, x):
        return self.fc(x)

# Instantiate the network
net = Net()

# Generate some dummy data
inputs = torch.randn(1, 10)
labels = torch.randn(1, 1)

# Define the loss function and optimizer
criterion = nn.MSELoss()
optimizer = optim.SGD(net.parameters(), lr=0.01)

# Training loop
for epoch in range(10):
    # Zero the parameter gradients
    optimizer.zero_grad()

    # Forward pass
    outputs = net(inputs)
    loss = criterion(outputs, labels)

    # Backward pass and optimize
    loss.backward()
    optimizer.step()

    # Print the loss for every epoch
    print(f"Epoch {epoch+1}, Loss: {loss.item()}")
