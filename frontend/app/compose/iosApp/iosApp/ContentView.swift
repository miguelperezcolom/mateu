import SwiftUI
import UIKit
import MateuKit // the Kotlin framework (baseName = "MateuKit")

struct ComposeView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        // MainViewControllerKt.MainViewController() is the iosMain entry point.
        MainViewControllerKt.MainViewController()
    }
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

struct ContentView: View {
    var body: some View {
        ComposeView()
            .ignoresSafeArea(.all) // Compose draws the whole screen
    }
}
